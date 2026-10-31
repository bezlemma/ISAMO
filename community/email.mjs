import nodemailer from 'nodemailer';
import { connect as tlsConnect } from 'node:tls';
import { token, hash, hex, encoder, hmacKey, fail, json } from './common.mjs';

export const emailConfigured = env => env.MAIL_ENABLED === 'true' && !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.MAIL_FROM);
export function mailTransport(env) {
  const port = Number(env.SMTP_PORT || 465);
  return nodemailer.createTransport({ host: env.SMTP_HOST, port, secure: port === 465, requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000, logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
    // Workers' native TLS connector resolves the hostname and validates its
    // certificate. Avoid Nodemailer's Node-specific multi-address fallback.
    ...(port === 465 ? { getSocket(_options, callback) {
      let finished = false;
      const socket = tlsConnect({ host: env.SMTP_HOST, port, servername: env.SMTP_HOST, rejectUnauthorized: true });
      const timer = setTimeout(() => finish(new Error('SMTP connection timed out.')), 8000);
      function finish(error) {
        if (finished) return; finished = true; clearTimeout(timer); socket.removeListener('error', finish);
        if (error) { socket.destroy(); callback(error); } else callback(null, { connection: socket, secured: true });
      }
      socket.once('error', finish); socket.once('secureConnect', () => finish());
    } } : {})
  });
}
export async function unsubscribeToken(env, memberId) {
  return memberId + '.' + hex(await crypto.subtle.sign('HMAC', await hmacKey(env.AUTH_PEPPER), encoder.encode('unsubscribe:' + memberId)));
}
export async function unsubscribe(request, env) {
  const value = new URL(request.url).searchParams.get('token') || '';
  const [memberId, signature] = value.split('.');
  if (!/^[a-f0-9-]{36}$/.test(memberId || '') || !/^[a-f0-9]{64}$/.test(signature || '') || !await crypto.subtle.verify('HMAC', await hmacKey(env.AUTH_PEPPER), Uint8Array.from(signature.match(/../g), x => parseInt(x, 16)), encoder.encode('unsubscribe:' + memberId))) fail(400, 'This unsubscribe link is invalid.');
  if (request.method === 'POST') await env.DB.prepare('UPDATE members SET mailing_list=0,mailing_updated=? WHERE id=?').bind(new Date().toISOString(), memberId).run();
  const message = request.method === 'POST' ? '<h1>You have unsubscribed</h1><p>You will no longer receive ISAMO news and event emails.</p>' : '<h1>ISAMO mailing list</h1><form method="post"><button type="submit">Unsubscribe from news and events</button></form>';
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ISAMO mailing preferences</title><style>body{font:18px system-ui;max-width:600px;margin:80px auto;padding:24px;color:#171717}button{background:#991b1b;color:white;border:0;border-radius:8px;padding:16px;font:inherit;cursor:pointer}a{color:#991b1b}</style>${message}<p><a href="https://avianmodel.org/membership">Return to your account</a></p></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'", 'Referrer-Policy': 'no-referrer' } });
}
export async function queueConfirmation(env, member) {
  if (!emailConfigured(env)) return 'not_configured';
  const code = token(), id = crypto.randomUUID(), now = Date.now();
  const verify = `https://avianmodel.org/confirm-email#${code}`;
  const optOut = `https://isamo-community.darien0.workers.dev/unsubscribe?token=${await unsubscribeToken(env, member.id)}`;
  const text = `Hello ${member.name},\n\nYour ISAMO community account has been created. Confirm your email address using this link within 48 hours:\n${verify}\n\n${member.mailing_list ? 'You are subscribed to ISAMO news and event updates. You can opt out at any time:\n' + optOut : 'You have opted out of ISAMO news and event updates.'}\n\nYou can edit your institution, role, research description and mailing preferences in your account:\nhttps://avianmodel.org/membership\n\nISAMO\nadmin@avianmodel.org`;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM email_tokens WHERE member_id=?').bind(member.id),
    env.DB.prepare('INSERT INTO email_tokens(token_hash,member_id,expires) VALUES(?,?,?)').bind(await hash(code), member.id, now + 48 * 3600000),
    env.DB.prepare('DELETE FROM email_outbox WHERE member_id=? AND sent_at IS NULL').bind(member.id),
    env.DB.prepare('INSERT INTO email_outbox(id,member_id,recipient,body,created,next_attempt) VALUES(?,?,?,?,?,?)').bind(id, member.id, member.email, text, now, now)
  ]);
  return 'queued';
}
export async function confirmEmail(env, code) {
  if (!/^[a-f0-9]{64}$/.test(code || '')) fail(400, 'This confirmation link is invalid.');
  const row = await env.DB.prepare('SELECT member_id FROM email_tokens WHERE token_hash=? AND expires>?').bind(await hash(code), Date.now()).first();
  if (!row) fail(400, 'This confirmation link has expired or has already been used. Sign in to request another.');
  await env.DB.batch([
    env.DB.prepare('UPDATE members SET email_verified=1 WHERE id=?').bind(row.member_id),
    env.DB.prepare('DELETE FROM email_tokens WHERE member_id=?').bind(row.member_id)
  ]);
  return json({ ok: true });
}
export async function deliverMail(env, send) {
  if (!emailConfigured(env)) return;
  const now = Date.now();
  // Atomic leases prevent concurrent request/cron runs from sending the same job.
  const jobs = (await env.DB.prepare('UPDATE email_outbox SET next_attempt=? WHERE id IN (SELECT id FROM email_outbox WHERE sent_at IS NULL AND attempts<6 AND next_attempt<=? AND created>? ORDER BY created LIMIT 3) RETURNING *').bind(now + 300000, now, now - 48 * 3600000).all()).results;
  if (!jobs.length) return;
  const transport = send ? null : mailTransport(env);
  for (const job of jobs) {
    try {
      const message = { from: { name: 'ISAMO', address: env.MAIL_FROM }, to: job.recipient, replyTo: 'admin@avianmodel.org', subject: 'Confirm your ISAMO account', text: job.body, messageId: `<${job.id}@avianmodel.org>`, disableFileAccess: true, disableUrlAccess: true };
      await (send ? send(message) : transport.sendMail(message));
      await env.DB.prepare("UPDATE email_outbox SET sent_at=?,body=NULL,last_error='' WHERE id=?").bind(Date.now(), job.id).run();
    } catch (error) {
      const diagnostic = String(error.message || 'Delivery failed').replaceAll(env.SMTP_PASSWORD, '[redacted]').replaceAll(env.SMTP_USER, '[sender]').slice(0,400);
      await env.DB.prepare('UPDATE email_outbox SET attempts=attempts+1,next_attempt=?,last_error=? WHERE id=?').bind(Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts), `${error.code || error.name}: ${diagnostic}`, job.id).run();
      console.error(JSON.stringify({ event: 'confirmation_delivery_failed', job: job.id }));
    }
  }
  transport?.close();
}
