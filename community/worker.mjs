// Secrets and the D1 binding are supplied at deployment, never bundled into source.
import { encoder, hex, token, hash, json, HttpError, fail, rawBody } from './common.mjs';
import { paymentConfig, checkout, paymentWebhook } from './payments.mjs';
import { emailConfigured, queueConfirmation, queuePasswordReset, deliverMail, confirmEmail, unsubscribe } from './email.mjs';
import { pageDefaults, validatePage } from '../shared/site-pages.mjs';
import { adminMembers } from './admin-members.mjs';
import { memberDues } from './dues.mjs';
import { deliverMemberMail } from './member-mail.mjs';

async function equal(a, b) {
  const key = await crypto.subtle.importKey('raw', encoder.encode('ISAMO constant-time comparison'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(a));
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(b));
}
async function passwordHash(password, salt, pepper) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password + pepper), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, material, 256));
}
function field(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, `${label} must be between ${min} and ${max} characters.`);
  return value.trim();
}
function password(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) fail(400, 'Use a password of 12 to 128 characters.');
  return value;
}
function email(value) {
  const result = field(value, 'Email', 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Enter a valid email address.');
  return result;
}
function postFields(data) {
  const title = field(data.title, 'Title', 1, 200), body = field(data.body, 'Message', 1, 10000);
  const kind = data.kind === 'event' ? 'event' : 'post';
  const eventDate = kind === 'event' ? field(data.event_date, 'Event date', 10, 10) : '';
  if (eventDate && (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !Number.isFinite(Date.parse(eventDate)))) fail(400, 'Choose a valid event date.');
  const link = field(data.link || '', 'Link', 0, 2000);
  if (link) { try { if (!['https:', 'http:'].includes(new URL(link).protocol)) fail(400, 'Use an http or https link.'); } catch { fail(400, 'Enter a complete website link.'); } }
  const series = kind === 'event' ? data.event_series || 'other' : '';
  if (kind === 'event' && !['ams', 'egged', 'seminar', 'other'].includes(series)) fail(400, 'Choose an event series.');
  return [title, body, kind, eventDate, link, series];
}
async function readBody(request, limit) {
  if (!request.headers.get('content-type')?.includes('application/json')) fail(415, 'Send JSON.');
  const raw = await rawBody(request, limit);
  try { const data = JSON.parse(raw); if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400, 'Invalid message.'); return data; } catch { fail(400, 'Invalid message.'); }
}
const publicMember = member => ({ id: member.id, name: member.name, email: member.email, institution: member.institution, role: member.role || '', research: member.research || '', mailing_list: !!member.mailing_list, email_verified: !!member.email_verified, is_admin: !!member.is_admin, created: member.created });
function profile(data, previous = {}) {
  if (typeof data.mailing_list !== 'boolean') fail(400, 'Choose your mailing preference.');
  return { name: field(data.name, 'Name', 1, 100), institution: field(data.institution, 'Institution', 1, 200), role: field(data.role, 'Role', 1, 100), research: field(data.research ?? previous.research ?? '', 'Research description', 0, 2000), mailing_list: Number(data.mailing_list) };
}
async function rate(env, key, max, seconds) {
  const now = Math.floor(Date.now() / 1000), bucket = Math.floor(now / seconds);
  const row = await env.DB.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key + ':' + bucket, now + seconds).first();
  if (row.count > max) fail(429, 'Please wait a few minutes before trying again.');
}
async function newSession(env, member) {
  const secret = token();
  await env.DB.prepare('INSERT INTO sessions VALUES(?,?,?)').bind(await hash(secret), member.id, Date.now() + 30 * 86400000).run();
  return { token: secret, member: publicMember(member) };
}
async function signedIn(request, env) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
  if (!/^[a-f0-9]{64}$/.test(bearer)) fail(401, 'Please sign in to continue.');
  const member = await env.DB.prepare('SELECT m.* FROM members m JOIN sessions s ON s.member_id=m.id WHERE s.token_hash=? AND s.expires>?').bind(await hash(bearer), Date.now()).first();
  if (!member) fail(401, 'Please sign in again.');
  return member;
}
async function handle(request, env, ctx) {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (path === '/health' && method === 'GET') return json({ ok: true });
  if (path === '/payments/webhook' && method === 'POST') return paymentWebhook(request, env);
  if (path === '/unsubscribe' && ['GET', 'POST'].includes(method)) return unsubscribe(request, env);
  if (path === '/auth/confirm-email' && method === 'POST') return confirmEmail(env, (await readBody(request)).token);
  if (!env.DEMO_KEY || !env.AUTH_PEPPER || !await equal(request.headers.get('x-demo-key') || '', env.DEMO_KEY)) fail(401, 'Open the password-protected ISAMO website to continue.');
  if (method !== 'GET') {
    const ip = await hash((request.headers.get('cf-connecting-ip') || 'local') + env.AUTH_PEPPER);
    await rate(env, 'write:' + ip, 100, 3600);
    if (path.startsWith('/auth/')) await rate(env, 'auth:' + ip, 15, 900);
  }
  if (/^\/admin\/(members|dues|emails)(\/|$)/.test(path)) {
    const admin = await signedIn(request, env);
    if (!admin.is_admin) fail(403, 'Administrator access is required.');
    return adminMembers(request, env, admin, { readBody, field, rate }, ctx);
  }
  if (path === '/auth/request-reset' && method === 'POST') {
    if (!emailConfigured(env)) fail(503, 'Email is unavailable. Use your saved recovery code or try again later.');
    const address = email((await readBody(request)).email);
    await rate(env, 'reset:' + await hash(address), 3, 3600);
    const member = await env.DB.prepare('SELECT id,email,name FROM members WHERE email=?').bind(address).first();
    if (member) { await queuePasswordReset(env, member); if (ctx) ctx.waitUntil(deliverMail(env)); }
    return json({ ok: true });
  }
  if (path === '/auth/reset-password' && method === 'POST') {
    const data = await readBody(request), pass = password(data.password);
    if (!/^[a-f0-9]{64}$/.test(data.token || '')) fail(400, 'This password link is invalid.');
    const salt = token(), recovery = token(), passwordDigest = await passwordHash(pass, salt, env.AUTH_PEPPER);
    const row = await env.DB.prepare('DELETE FROM password_reset_tokens WHERE token_hash=? AND expires>? RETURNING member_id').bind(await hash(data.token), Date.now()).first();
    if (!row) fail(400, 'This password link has expired or has already been used. Request another from the login page.');
    await env.DB.batch([
      env.DB.prepare('UPDATE members SET password_hash=?,salt=?,recovery_hash=?,email_verified=1 WHERE id=?').bind(passwordDigest, salt, await hash(recovery), row.member_id),
      env.DB.prepare('DELETE FROM sessions WHERE member_id=?').bind(row.member_id),
      env.DB.prepare('DELETE FROM password_reset_tokens WHERE member_id=?').bind(row.member_id)
    ]);
    return json({ ok: true, recovery });
  }
  const pageMatch = path.match(/^\/pages\/([a-z-]+)$/);
  if (pageMatch) {
    const slug = pageMatch[1];
    if (!Object.hasOwn(pageDefaults, slug)) fail(404, 'Page not found.');
    if (method === 'GET') {
      const saved = await env.DB.prepare('SELECT content,revision FROM site_pages WHERE slug=?').bind(slug).first();
      return json({ content: saved ? JSON.parse(saved.content) : pageDefaults[slug], revision: saved?.revision || 0 });
    }
    if (method === 'PATCH') {
      const member = await signedIn(request, env);
      if (!member.is_admin) fail(403, 'Administrator access is required.');
      const data = await readBody(request, 250000);
      if (!Number.isSafeInteger(data.revision) || data.revision < 0) fail(400, 'Reload this page before editing.');
      let content;
      try { content = validatePage(slug, data.content); } catch (error) { fail(400, error.message); }
      const values = [JSON.stringify(content), new Date().toISOString(), member.id, slug];
      const saved = data.revision === 0
        ? await env.DB.prepare('INSERT INTO site_pages(content,updated,updated_by,slug) VALUES(?,?,?,?) ON CONFLICT(slug) DO NOTHING RETURNING revision').bind(...values).first()
        : await env.DB.prepare('UPDATE site_pages SET content=?,updated=?,updated_by=?,revision=revision+1 WHERE slug=? AND revision=? RETURNING revision').bind(...values, data.revision).first();
      if (!saved) fail(409, 'Another administrator changed this page. Cancel to load the latest version, then edit again.');
      return json({ content, revision: saved.revision });
    }
  }
  if (method === 'POST' && ['/auth/register', '/auth/login', '/auth/recover'].includes(path)) {
    const data = await readBody(request), address = email(data.email);
    await rate(env, 'email:' + await hash(address), 15, 900);
    const member = await env.DB.prepare('SELECT * FROM members WHERE email=?').bind(address).first();
    if (path === '/auth/register') {
      if (member) fail(409, 'That email is already registered. Please sign in.');
      const pass = password(data.password), salt = token(), recovery = token();
      const record = { id: crypto.randomUUID(), email: address, ...profile(data), created: new Date().toISOString(), is_admin: 0 };
      await env.DB.prepare('INSERT INTO members(id,email,name,institution,role,research,mailing_list,mailing_updated,password_hash,salt,recovery_hash,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(record.id, record.email, record.name, record.institution, record.role, record.research, record.mailing_list, record.created, await passwordHash(pass, salt, env.AUTH_PEPPER), salt, await hash(recovery), record.created).run();
      let emailStatus = 'unavailable';
      try { emailStatus = await queueConfirmation(env, record); if (ctx) ctx.waitUntil(deliverMail(env)); } catch { console.error(JSON.stringify({ event: 'confirmation_queue_failed' })); }
      return json({ ...await newSession(env, record), recovery, email_status: emailStatus }, 201);
    }
    if (path === '/auth/recover') {
      if (!member || !await equal(await hash(String(data.recovery || '').trim()), member.recovery_hash)) fail(400, 'The email or recovery code did not match.');
      const pass = password(data.password), salt = token(), recovery = token();
      await env.DB.batch([
        env.DB.prepare('UPDATE members SET password_hash=?,salt=?,recovery_hash=? WHERE id=?').bind(await passwordHash(pass, salt, env.AUTH_PEPPER), salt, await hash(recovery), member.id),
        env.DB.prepare('DELETE FROM sessions WHERE member_id=?').bind(member.id)
      ]);
      return json({ ...await newSession(env, member), recovery });
    }
    const candidate = await passwordHash(String(data.password || '').slice(0, 128), member?.salt || 'unknown-account-salt', env.AUTH_PEPPER);
    if (!member || !await equal(candidate, member.password_hash)) fail(401, 'The email or password did not match.');
    return json(await newSession(env, member));
  }
  if (path === '/auth/logout' && method === 'POST') {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(request.headers.get('authorization')?.replace(/^Bearer /, '') || '')).run();
    return json({ ok: true });
  }
  if (path === '/me') {
    const member = await signedIn(request, env);
    if (method === 'GET') return json(publicMember(member));
    if (method === 'PATCH') {
      const values = profile(await readBody(request), member);
      await env.DB.prepare('UPDATE members SET name=?,institution=?,role=?,research=?,mailing_list=?,mailing_updated=? WHERE id=?').bind(values.name, values.institution, values.role, values.research, values.mailing_list, new Date().toISOString(), member.id).run();
      return json(publicMember({ ...member, ...values }));
    }
  }
  if (path === '/membership/config' && method === 'GET') {
    const config = paymentConfig(env);
    return json({ payments_enabled: config.enabled, email_enabled: emailConfigured(env), plans: Object.entries(config.plans).map(([id, plan]) => ({ id, label: plan.label, days: plan.days })) });
  }
  if (path === '/membership/status' && method === 'GET') {
    const member = await signedIn(request, env);
    return json(await memberDues(env, member.id));
  }
  if (path === '/membership/checkout' && method === 'POST') {
    const member = await signedIn(request, env); await rate(env, 'checkout:' + member.id, 5, 1800);
    return json(await checkout(env, member, (await readBody(request)).plan));
  }
  if (path === '/auth/resend-confirmation' && method === 'POST') {
    const member = await signedIn(request, env); await rate(env, 'confirmation:' + member.id, 3, 3600);
    if (member.email_verified) return json({ email_status: 'verified' });
    const status = await queueConfirmation(env, member);
    if (ctx) ctx.waitUntil(deliverMail(env));
    return json({ email_status: status });
  }
  if (path === '/admin/mailing-list' && method === 'GET') {
    const member = await signedIn(request, env);
    if (!member.is_admin) fail(403, 'Administrator access is required.');
    const result = await env.DB.prepare('SELECT name,email,institution,role,mailing_updated FROM members WHERE mailing_list=1 AND email_verified=1 ORDER BY name').all();
    return json({ members: result.results });
  }
  if (path === '/admin/retry-email' && method === 'POST') {
    const member = await signedIn(request, env);
    if (!member.is_admin) fail(403, 'Administrator access is required.');
    await deliverMail(env);
    const result = await env.DB.prepare('SELECT COUNT(*) AS pending FROM email_outbox WHERE sent_at IS NULL').first();
    return json({ pending: result.pending });
  }
  if (path === '/posts' && method === 'GET') {
    const before = url.searchParams.get('before') || '9999', events = url.searchParams.get('kind') === 'event';
    const result = await env.DB.prepare(`SELECT p.*, m.name AS author, m.institution FROM posts p JOIN members m ON m.id=p.author_id WHERE p.deleted=0 AND p.created<? ${events ? "AND p.kind='event' AND p.event_date>=?" : ''} ORDER BY ${events ? 'p.event_date ASC' : 'p.created DESC'} LIMIT 31`).bind(...(events ? [before, new Date().toISOString().slice(0, 10)] : [before])).all();
    const posts = result.results.slice(0, 30);
    return json({ posts, next: result.results.length > 30 ? posts.at(-1).created : null });
  }
  if (path === '/posts' && method === 'POST') {
    const member = await signedIn(request, env); await rate(env, 'post:' + member.id, 30, 3600);
    const values = postFields(await readBody(request)), id = crypto.randomUUID(), now = new Date().toISOString();
    await env.DB.prepare('INSERT INTO posts(id,author_id,title,body,kind,event_date,link,event_series,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id, member.id, ...values, now, now).run();
    return json({ id }, 201);
  }
  const match = path.match(/^\/posts\/([a-f0-9-]{36})(\/comments)?$/);
  if (match) {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(match[1]).first();
    if (!post) fail(404, 'Post not found.');
    if (match[2] && !post.deleted) {
      if (method === 'GET') return json((await env.DB.prepare('SELECT c.id,c.body,c.created,c.author_id,m.name AS author FROM comments c JOIN members m ON m.id=c.author_id WHERE c.post_id=? AND c.deleted=0 ORDER BY c.created LIMIT 200').bind(post.id).all()).results);
      if (method === 'POST') {
        const member = await signedIn(request, env), data = await readBody(request), id = crypto.randomUUID();
        await rate(env, 'comment:' + member.id, 60, 3600);
        await env.DB.prepare('INSERT INTO comments(id,post_id,author_id,body,created) VALUES(?,?,?,?,?)').bind(id, post.id, member.id, field(data.body, 'Reply', 1, 4000), new Date().toISOString()).run();
        return json({ id }, 201);
      }
    } else if (!match[2]) {
      const member = await signedIn(request, env);
      if (post.author_id !== member.id && !member.is_admin) fail(403, 'You can only change your own posts.');
      if (method === 'DELETE') { await env.DB.prepare('UPDATE posts SET deleted=1 WHERE id=?').bind(post.id).run(); return json({ ok: true }); }
      if (method === 'PATCH') {
        const data = await readBody(request);
        if (data.restore === true) await env.DB.prepare('UPDATE posts SET deleted=0 WHERE id=?').bind(post.id).run();
        else await env.DB.prepare('UPDATE posts SET title=?,body=?,kind=?,event_date=?,link=?,event_series=?,updated=? WHERE id=?').bind(...postFields(data), new Date().toISOString(), post.id).run();
        return json({ ok: true });
      }
    }
  }
  const commentMatch = path.match(/^\/comments\/([a-f0-9-]{36})$/);
  if (commentMatch && method === 'DELETE') {
    const member = await signedIn(request, env), comment = await env.DB.prepare('SELECT author_id FROM comments WHERE id=?').bind(commentMatch[1]).first();
    if (!comment) fail(404, 'Reply not found.');
    if (comment.author_id !== member.id && !member.is_admin) fail(403, 'You can only remove your own replies.');
    await env.DB.prepare('UPDATE comments SET deleted=1 WHERE id=?').bind(commentMatch[1]).run();
    return json({ ok: true });
  }
  fail(404, 'Not found.');
}
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').includes(origin);
    if (origin && !allowed) return json({ error: 'This website is not allowed.' }, 403);
    let response;
    try {
      response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await handle(request, env, ctx);
    } catch (error) {
      if (!(error instanceof HttpError)) console.error(JSON.stringify({ event: 'request_failed', path: new URL(request.url).pathname }));
      response = json({ error: error instanceof HttpError ? error.message : 'The community service is temporarily unavailable. Please try again.' }, error.status || 503);
    }
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store'); headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Vary', 'Origin');
    if (allowed) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Demo-Key');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    return new Response(response.body, { status: response.status, headers });
  },
  async scheduled(_event, env) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()),
      env.DB.prepare('DELETE FROM rate_limits WHERE expires<?').bind(Math.floor(Date.now() / 1000))
    ]);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM email_tokens WHERE expires<?').bind(Date.now()),
      env.DB.prepare('DELETE FROM password_reset_tokens WHERE expires<?').bind(Date.now()),
      env.DB.prepare('DELETE FROM email_outbox WHERE created<?').bind(Date.now() - 7 * 86400000),
      env.DB.prepare("DELETE FROM member_emails WHERE state='draft' AND created<?").bind(Date.now() - 7 * 86400000)
    ]);
    await deliverMail(env);
    await deliverMemberMail(env);
  }
};
