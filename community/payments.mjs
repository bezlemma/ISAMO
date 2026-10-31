import { encoder, hex, hmacKey, rawBody, json, fail } from './common.mjs';

// No network requests or checkout links are possible until explicitly enabled.
export function paymentConfig(env) {
  if (env.PAYMENTS_ENABLED !== 'true' || !env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) return { enabled: false, plans: {} };
  let plans;
  try { plans = JSON.parse(env.MEMBERSHIP_PLANS || '{}'); } catch { return { enabled: false, plans: {} }; }
  const entries = plans && !Array.isArray(plans) ? Object.entries(plans) : [];
  if (!entries.length || entries.some(([id, p]) => !p || !/^[a-z0-9-]{1,40}$/.test(id) || !/^price_[A-Za-z0-9]+$/.test(p.priceId) || typeof p.label !== 'string' || p.label.length > 100 || !Number.isInteger(p.days) || p.days < 1 || p.days > 366)) return { enabled: false, plans: {} };
  return { enabled: true, plans };
}
async function stripe(env, path, body, key) {
  const response = await (env.STRIPE_FETCH || fetch)('https://api.stripe.com/v1/' + path, {
    method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(15000),
    headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY, 'Stripe-Version': '2026-09-30.endive', ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...(key ? { 'Idempotency-Key': key } : {}) },
    body: body ? new URLSearchParams(body) : undefined
  });
  if (!response.ok) fail(503, 'Payment service is unavailable. Please try again.');
  return response.json();
}
export async function checkout(env, member, planId) {
  const config = paymentConfig(env);
  if (!config.enabled) fail(503, 'Membership payments are not open yet.');
  const plan = Object.hasOwn(config.plans, planId) ? config.plans[planId] : null;
  if (!plan) fail(400, 'Choose a membership option.');
  const price = await stripe(env, 'prices/' + plan.priceId);
  if (!price.active || price.recurring || price.type !== 'one_time' || !Number.isInteger(price.unit_amount) || price.unit_amount <= 0) fail(503, 'This membership option is not ready for payment.');
  // The member, price, term, and return URLs all come from trusted server data.
  const requestId = `${member.id}:${planId}:${Math.floor(Date.now() / 1800000)}`;
  const session = await stripe(env, 'checkout/sessions', {
    mode: 'payment', 'line_items[0][price]': plan.priceId, 'line_items[0][quantity]': '1',
    customer_email: member.email, client_reference_id: member.id,
    success_url: 'https://avianmodel.org/membership?payment=received',
    cancel_url: 'https://avianmodel.org/membership?payment=cancelled'
  }, requestId);
  if (!/^cs_[A-Za-z0-9_]+$/.test(session.id || '') || !session.url?.startsWith('https://checkout.stripe.com/')) fail(503, 'Could not open checkout.');
  await env.DB.prepare('INSERT OR IGNORE INTO checkouts(id,member_id,price_id,days,amount,currency,created) VALUES(?,?,?,?,?,?,?)')
    .bind(session.id, member.id, plan.priceId, plan.days, price.unit_amount, price.currency, Date.now()).run();
  return { url: session.url };
}
export async function paymentWebhook(request, env) {
  if (!paymentConfig(env).enabled) fail(503, 'Membership payments are not open yet.');
  const raw = await rawBody(request, 256000), header = request.headers.get('stripe-signature') || '';
  const parts = header.split(',').map(x => x.trim().split('='));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  if (!/^\d+$/.test(timestamp || '') || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) fail(400, 'Invalid webhook signature.');
  const key = await hmacKey(env.STRIPE_WEBHOOK_SECRET, ['verify']);
  let valid = false;
  for (const [name, signature] of parts) {
    if (name !== 'v1' || !/^[a-f0-9]{64}$/.test(signature || '')) continue;
    const bytes = Uint8Array.from(signature.match(/../g), x => parseInt(x, 16));
    if (await crypto.subtle.verify('HMAC', key, bytes, encoder.encode(`${timestamp}.${raw}`))) valid = true;
  }
  if (!valid) fail(400, 'Invalid webhook signature.');
  let event;
  try { event = JSON.parse(raw); } catch { fail(400, 'Invalid webhook.'); }
  if (!event.id || !event.data?.object) fail(400, 'Invalid webhook.');
  if (await env.DB.prepare('SELECT id FROM payment_events WHERE id=?').bind(event.id).first()) return json({ received: true });
  const object = event.data.object;
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    if (!/^cs_[A-Za-z0-9_]+$/.test(object.id || '')) fail(400, 'Invalid checkout.');
    const local = await env.DB.prepare('SELECT * FROM checkouts WHERE id=?').bind(object.id).first();
    if (!local) fail(503, 'Checkout is not recorded yet.');
    const session = await stripe(env, `checkout/sessions/${object.id}?expand[]=line_items`);
    if (session.payment_status !== 'paid') return json({ received: true });
    const line = session.line_items?.data;
    if (session.mode !== 'payment' || session.client_reference_id !== local.member_id || line?.length !== 1 || line[0].price?.id !== local.price_id || line[0].quantity !== 1 || session.amount_total !== local.amount || session.currency !== local.currency) fail(400, 'Payment does not match this membership.');
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(`INSERT OR IGNORE INTO membership_payments(session_id,member_id,payment_intent,paid_at,valid_until) SELECT ?,?,?,?,MAX(?,COALESCE(MAX(valid_until),0))+? FROM membership_payments WHERE member_id=? AND revoked=0`)
        .bind(local.id, local.member_id, typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || '', now, now, local.days * 86400000, local.member_id),
      env.DB.prepare('INSERT OR IGNORE INTO payment_events(id,created) VALUES(?,?)').bind(event.id, now)
    ]);
  } else if (['charge.refunded', 'charge.dispute.created', 'radar.early_fraud_warning.created'].includes(event.type)) {
    const chargeId = event.type === 'charge.refunded' ? object.id : typeof object.charge === 'string' ? object.charge : object.charge?.id;
    if (!/^ch_[A-Za-z0-9]+$/.test(chargeId || '')) fail(400, 'Invalid charge.');
    const charge = await stripe(env, 'charges/' + chargeId);
    const intent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    await env.DB.batch([
      env.DB.prepare('UPDATE membership_payments SET revoked=MAX(revoked,?),review_reason=? WHERE payment_intent=?').bind(event.type === 'charge.refunded' && charge.refunded ? 1 : 0, event.type, intent || ''),
      env.DB.prepare('INSERT OR IGNORE INTO payment_events(id,created) VALUES(?,?)').bind(event.id, Date.now())
    ]);
  }
  return json({ received: true });
}
