import { fail, json } from './common.mjs';
import { duesJoin, duesStatus } from './dues.mjs';
import { emailConfigured } from './email.mjs';
import { DAILY_RECIPIENT_LIMIT, mailUsageSql, deliverMemberMail } from './member-mail.mjs';

const columns = 'm.id,m.name,m.email,m.institution,m.role,m.created,m.is_admin,m.email_verified,m.mailing_list,d.paid_until,d.waived_until,d.covered_until';
const statusSql = "CASE WHEN d.paid_until>=? THEN 'paid' WHEN d.waived_until>=? THEN 'waived' WHEN d.covered_until IS NOT NULL THEN 'expired' ELSE 'none' END";
function criteria(query) {
  const search = String(query.q || '').trim().slice(0, 100);
  const status = String(query.dues || 'all');
  if (!['all', 'paid', 'waived', 'expired', 'none'].includes(status)) fail(400, 'Choose a dues status.');
  const values = [], clauses = ['1=1'];
  if (search) {
    clauses.push("(m.name LIKE ? ESCAPE '\\' OR m.email LIKE ? ESCAPE '\\' OR m.institution LIKE ? ESCAPE '\\')");
    const pattern = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
    values.push(pattern, pattern, pattern);
  }
  if (status !== 'all') { clauses.push(`(${statusSql})=?`); values.push(Date.now(), Date.now(), status); }
  return { sql: clauses.join(' AND '), values };
}
function date(value, label, end = false) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400, `Choose a valid ${label}.`);
  const time = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value || time < Date.UTC(2000, 0, 1) || time > Date.UTC(2100, 0, 1)) fail(400, `Choose a valid ${label}.`);
  return time + (end ? 86400000 - 1 : 0);
}
function uuid(value) {
  if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value)) fail(400, 'Invalid record identifier.');
  return value;
}
async function emailDetail(env, id) {
  const email = await env.DB.prepare('SELECT e.*,m.name AS author FROM member_emails e JOIN members m ON m.id=e.created_by WHERE e.id=?').bind(id).first();
  if (!email) fail(404, 'Email not found.');
  const recipients = (await env.DB.prepare('SELECT r.member_id,m.name,r.recipient,r.status,r.attempts,r.sent_at,r.last_error FROM member_email_recipients r JOIN members m ON m.id=r.member_id WHERE r.email_id=? ORDER BY m.name COLLATE NOCASE,r.id').bind(id).all()).results;
  return { ...email, recipients };
}
const kickMail = (ctx, env) => { if (ctx) ctx.waitUntil(deliverMemberMail(env).catch(() => console.error(JSON.stringify({ event: 'member_mail_delivery_failed' })))); };

// Called only after the Worker has authenticated a current administrator.
export async function adminMembers(request, env, admin, { readBody, field, rate }, ctx) {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (path === '/admin/members' && method === 'GET') {
    const filter = criteria(Object.fromEntries(url.searchParams)), offset = Number(url.searchParams.get('offset') || 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) fail(400, 'Invalid page.');
    const from = `FROM members m ${duesJoin} WHERE ${filter.sql}`;
    const total = await env.DB.prepare(`SELECT COUNT(*) AS n ${from}`).bind(...filter.values).first();
    const rows = (await env.DB.prepare(`SELECT ${columns} ${from} ORDER BY m.name COLLATE NOCASE,m.id LIMIT 100 OFFSET ?`).bind(...filter.values, offset).all()).results;
    return json({ members: rows.map(m => ({ ...m, dues_status: duesStatus(m) })), total: total.n, next: offset + rows.length < total.n ? offset + rows.length : null });
  }
  const memberPath = path.match(/^\/admin\/members\/([a-f0-9-]{36})\/dues$/);
  if (memberPath) {
    const id = memberPath[1];
    if (!await env.DB.prepare('SELECT id FROM members WHERE id=?').bind(id).first()) fail(404, 'Member not found.');
    if (method === 'GET') {
      const records = (await env.DB.prepare(`SELECT x.*,a.name AS recorded_by,v.name AS voided_by_name FROM manual_dues x
        JOIN members a ON a.id=x.created_by LEFT JOIN members v ON v.id=x.voided_by WHERE x.member_id=? ORDER BY x.created DESC LIMIT 100`).bind(id).all()).results;
      const online = (await env.DB.prepare(`SELECT p.session_id AS id,p.paid_at,p.valid_until,p.revoked,p.review_reason,c.amount,c.currency
        FROM membership_payments p JOIN checkouts c ON c.id=p.session_id WHERE p.member_id=? ORDER BY p.paid_at DESC LIMIT 100`).bind(id).all()).results;
      return json({ records, online });
    }
    if (method === 'POST') {
      const data = await readBody(request), recordId = uuid(data.id);
      if (!['paid', 'waived'].includes(data.kind)) fail(400, 'Choose payment or fee waiver.');
      if (!['GBP', 'USD', 'EUR', 'CAD', 'AUD'].includes(data.currency)) fail(400, 'Choose a currency.');
      if (!Number.isSafeInteger(data.amount) || data.amount < 0 || data.amount > 100000000 || (data.kind === 'paid' ? data.amount === 0 : data.amount !== 0)) fail(400, 'Enter a valid amount.');
      const paidAt = date(data.paid_date, 'payment date'), until = date(data.valid_until, 'membership end date', true);
      if (paidAt > Date.now() || until < paidAt) fail(400, 'The payment date must be today or earlier, and the membership end date must follow it.');
      const paymentMethod = data.kind === 'waived' ? 'waiver' : data.method;
      if (!['bank transfer', 'cash', 'cheque', 'other', 'waiver'].includes(paymentMethod) || (data.kind === 'paid' && paymentMethod === 'waiver')) fail(400, 'Choose a payment method.');
      const note = field(data.note || '', 'Note', 0, 1000);
      const values = [id, data.kind, data.amount, data.currency, paidAt, until, paymentMethod, note, admin.id];
      const inserted = await env.DB.prepare('INSERT INTO manual_dues(id,member_id,kind,amount,currency,paid_at,valid_until,method,note,created_by,created) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id').bind(recordId, ...values, Date.now()).first();
      if (!inserted) {
        const previous = await env.DB.prepare('SELECT * FROM manual_dues WHERE id=?').bind(recordId).first();
        const keys = ['member_id','kind','amount','currency','paid_at','valid_until','method','note','created_by'];
        if (keys.some((key, i) => previous[key] !== values[i])) fail(409, 'This entry was already saved with different details. Reload before adding another.');
      }
      return json({ id: recordId }, inserted ? 201 : 200);
    }
  }
  const voidPath = path.match(/^\/admin\/dues\/([a-f0-9-]{36})\/void$/);
  if (voidPath && method === 'POST') {
    const reason = field((await readBody(request)).reason, 'Reason', 1, 400);
    const entry = await env.DB.prepare('SELECT id,voided_at FROM manual_dues WHERE id=?').bind(voidPath[1]).first();
    if (!entry) fail(404, 'Dues entry not found.');
    await env.DB.prepare('UPDATE manual_dues SET voided_at=?,voided_by=?,void_reason=? WHERE id=? AND voided_at IS NULL').bind(Date.now(), admin.id, reason, entry.id).run();
    return json({ ok: true });
  }
  if (path === '/admin/emails' && method === 'GET') {
    const emails = (await env.DB.prepare(`SELECT e.id,e.subject,e.kind,e.state,e.created,e.queued_at,m.name AS author,
      COUNT(r.id) AS total,SUM(r.status='sent') AS sent,SUM(r.status='failed') AS failed,
      SUM(r.status IN ('pending','sending')) AS pending,SUM(r.status IN ('skipped','cancelled')) AS skipped
      FROM member_emails e JOIN members m ON m.id=e.created_by LEFT JOIN member_email_recipients r ON r.email_id=e.id
      WHERE e.state!='draft' GROUP BY e.id ORDER BY e.created DESC LIMIT 50`).all()).results;
    const usage = await env.DB.prepare(mailUsageSql).bind(Date.now() - 86400000).first();
    return json({ emails, enabled: emailConfigured(env), remaining: Math.max(0, DAILY_RECIPIENT_LIMIT - usage.n) });
  }
  if (path === '/admin/emails/preview' && method === 'POST') {
    if (!emailConfigured(env)) fail(503, 'Email sending is unavailable.');
    await rate(env, 'mail-preview:' + admin.id, 30, 3600);
    const data = await readBody(request, 50000);
    if (!['news', 'membership'].includes(data.kind)) fail(400, 'Choose the purpose of this email.');
    const subject = field(data.subject, 'Subject', 1, 150), body = field(data.body, 'Message', 1, 10000);
    if (/[\r\n\x00-\x1f\x7f]/.test(subject)) fail(400, 'The subject must be one line.');
    let selection;
    if (Array.isArray(data.member_ids)) {
      if (!data.member_ids.length || data.member_ids.length > 500) fail(400, 'Choose between 1 and 500 members.');
      selection = { sql: 'm.id IN (SELECT value FROM json_each(?))', values: [JSON.stringify([...new Set(data.member_ids.map(uuid))])] };
    } else if (data.filter && typeof data.filter === 'object') selection = criteria(data.filter);
    else fail(400, 'Choose the recipients.');
    const matches = (await env.DB.prepare(`SELECT m.id,m.name,m.email,m.mailing_list,m.email_verified FROM members m ${duesJoin} WHERE ${selection.sql} ORDER BY m.name COLLATE NOCASE,m.id LIMIT 501`).bind(...selection.values).all()).results;
    if (matches.length > 500) fail(400, 'Narrow the selection to 500 members or fewer.');
    const recipients = matches.filter(m => data.kind !== 'news' || (m.mailing_list && m.email_verified));
    if (!recipients.length) fail(400, data.kind === 'news' ? 'No selected members have both confirmed their email and subscribed to news.' : 'No members selected.');
    const id = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO member_emails(id,kind,subject,body,created,created_by) VALUES(?,?,?,?,?,?)').bind(id, data.kind, subject, body, Date.now(), admin.id),
      env.DB.prepare("INSERT INTO member_email_recipients(id,email_id,member_id,recipient) SELECT json_extract(value,'$.id'),?,json_extract(value,'$.member_id'),json_extract(value,'$.email') FROM json_each(?)")
        .bind(id, JSON.stringify(recipients.map(m => ({ id: crypto.randomUUID(), member_id: m.id, email: m.email }))))
    ]);
    return json({ ...await emailDetail(env, id), excluded: matches.length - recipients.length }, 201);
  }
  const mailPath = path.match(/^\/admin\/emails\/([a-f0-9-]{36})(?:\/(send|cancel|retry))?$/);
  if (mailPath) {
    const id = mailPath[1], action = mailPath[2];
    if (!action && method === 'GET') return json(await emailDetail(env, id));
    if (method === 'POST') {
      const email = await env.DB.prepare('SELECT * FROM member_emails WHERE id=?').bind(id).first();
      if (!email) fail(404, 'Email not found.');
      if (action === 'send') {
        if (!emailConfigured(env)) fail(503, 'Email sending is unavailable.');
        if (email.state === 'cancelled') fail(409, 'This email was cancelled.');
        if (email.state === 'draft') {
          if (email.created < Date.now() - 86400000) fail(409, 'This preview has expired. Preview the email again.');
          const queued = await env.DB.prepare(`UPDATE member_emails SET state='queued',queued_at=? WHERE id=? AND state='draft'
            AND ((SELECT COUNT(*) FROM member_email_recipients WHERE email_id=?) + (${mailUsageSql.replace(' AS n', '')}))<=? RETURNING id`)
            .bind(Date.now(), id, id, Date.now() - 86400000, DAILY_RECIPIENT_LIMIT).first();
          if (!queued && (await env.DB.prepare('SELECT state FROM member_emails WHERE id=?').bind(id).first()).state !== 'queued') fail(429, 'This would exceed 200 recipients in 24 hours. Choose a smaller group or try later.');
        }
        kickMail(ctx, env);
      } else if (action === 'cancel') {
        await env.DB.batch([
          env.DB.prepare("UPDATE member_emails SET state='cancelled' WHERE id=?").bind(id),
          env.DB.prepare("UPDATE member_email_recipients SET status='cancelled' WHERE email_id=? AND status IN ('pending','failed')").bind(id)
        ]);
      } else if (action === 'retry') {
        if (email.state !== 'queued') fail(409, 'Only queued emails can be retried.');
        await rate(env, 'mail-retry:' + admin.id, 3, 3600);
        await env.DB.prepare("UPDATE member_email_recipients SET status='pending',attempts=0,next_attempt=0,last_error='' WHERE email_id=? AND status='failed'").bind(id).run();
        kickMail(ctx, env);
      } else fail(404, 'Not found.');
      return json(await emailDetail(env, id));
    }
  }
  fail(404, 'Not found.');
}
