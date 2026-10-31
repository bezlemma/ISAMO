export const encoder = new TextEncoder();
export const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
export const token = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const hash = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
export const json = (data, status = 200) => Response.json(data, { status });
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const fail = (status, message) => { throw new HttpError(status, message); };
export async function rawBody(request, limit = 20000) {
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'A message is required.');
  const chunks = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > limit) { await reader.cancel(); fail(413, 'This message is too large.'); } chunks.push(value); }
  const buffer = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(buffer);
}
export async function hmacKey(secret, usages = ['sign', 'verify']) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages);
}
