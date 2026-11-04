import { emailConfigured, mailTransport, unsubscribeToken } from './email.mjs';

export const DAILY_RECIPIENT_LIMIT = 200;
export const mailUsageSql = `SELECT COUNT(*) AS n FROM member_email_recipients r
  JOIN member_emails e ON e.id=r.email_id WHERE e.queued_at>?`;

export async function deliverMemberMail(env, send) {
  if (!emailConfigured(env)) return;
  const now = Date.now(), lease = crypto.randomUUID();
  await env.DB.prepare("UPDATE member_email_recipients SET status='cancelled',lease=NULL WHERE status='sending' AND next_attempt<=? AND email_id IN (SELECT id FROM member_emails WHERE state='cancelled')").bind(now).run();
  // A durable lease prevents overlapping cron and request runs claiming a job.
  const jobs = (await env.DB.prepare(`UPDATE member_email_recipients SET status='sending',lease=?,next_attempt=?
    WHERE id IN (SELECT r.id FROM member_email_recipients r JOIN member_emails e ON e.id=r.email_id
      WHERE e.state='queued' AND r.status IN ('pending','sending') AND r.next_attempt<=? AND r.attempts<6
      ORDER BY e.queued_at,r.id LIMIT 5) RETURNING *`).bind(lease, now + 300000, now).all()).results;
  if (!jobs.length) return;
  const transport = send ? null : mailTransport(env);
  try {
    await Promise.all(jobs.map(async job => {
      const current = await env.DB.prepare(`SELECT e.state,e.kind,e.subject,e.body,m.email,m.email_verified,m.mailing_list
        FROM member_emails e JOIN members m ON m.id=? WHERE e.id=?`).bind(job.member_id, job.email_id).first();
      const reason = current.state !== 'queued' ? 'Sending cancelled.' : current.email !== job.recipient ? 'Email address changed.'
        : current.kind === 'news' && (!current.email_verified || !current.mailing_list) ? 'No longer subscribed with a confirmed email address.' : '';
      if (reason) {
        await env.DB.prepare("UPDATE member_email_recipients SET status='skipped',last_error=?,lease=NULL WHERE id=? AND lease=?").bind(reason, job.id, lease).run();
        return;
      }
      const optOut = current.kind === 'news' ? `\n\nUnsubscribe from ISAMO news and events:\nhttps://isamo-community.darien0.workers.dev/unsubscribe?token=${await unsubscribeToken(env, job.member_id)}` : '';
      const message = { from: { name: 'ISAMO', address: env.MAIL_FROM }, to: job.recipient,
        replyTo: 'admin@avianmodel.org', subject: current.subject,
        text: `${current.body}\n\nISAMO\nadmin@avianmodel.org${optOut}`,
        messageId: `<${job.id}@avianmodel.org>`, disableFileAccess: true, disableUrlAccess: true };
      try {
        await (send ? send(message) : transport.sendMail(message));
      } catch (error) {
        const permanent = Number(error.responseCode) >= 500;
        const status = permanent || job.attempts >= 5 ? 'failed' : 'pending';
        // Provider errors may contain credentials or addresses. Store a bounded category only.
        const diagnostic = permanent ? 'Mail server rejected this message.' : 'Mail service unavailable. Delivery will be retried.';
        await env.DB.prepare('UPDATE member_email_recipients SET status=?,attempts=attempts+1,next_attempt=?,last_error=?,lease=NULL WHERE id=? AND lease=?')
          .bind(status, Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts), status === 'failed' && !permanent ? 'Delivery failed after six attempts.' : diagnostic, job.id, lease).run();
        return;
      }
      await env.DB.prepare("UPDATE member_email_recipients SET status='sent',sent_at=?,last_error='',lease=NULL WHERE id=? AND lease=?").bind(Date.now(), job.id, lease).run();
    }));
  } finally { transport?.close(); }
}
