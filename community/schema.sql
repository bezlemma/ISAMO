PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL, institution TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '', research TEXT NOT NULL DEFAULT '',
  mailing_list INTEGER NOT NULL DEFAULT 0, mailing_updated TEXT NOT NULL DEFAULT '', email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT NOT NULL, salt TEXT NOT NULL, recovery_hash TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY, author_id TEXT NOT NULL REFERENCES members(id),
  title TEXT NOT NULL, body TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'post',
  event_date TEXT NOT NULL DEFAULT '', link TEXT NOT NULL DEFAULT '',
  event_series TEXT NOT NULL DEFAULT 'other',
  created TEXT NOT NULL, updated TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS posts_feed ON posts(deleted, created DESC);
CREATE INDEX IF NOT EXISTS posts_events ON posts(kind, deleted, event_date);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id),
  author_id TEXT NOT NULL REFERENCES members(id), body TEXT NOT NULL,
  created TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id, deleted, created);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS rate_expiry ON rate_limits(expires);
CREATE TABLE IF NOT EXISTS email_tokens (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS email_outbox (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), recipient TEXT NOT NULL, body TEXT, created INTEGER NOT NULL, next_attempt INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER, last_error TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS email_pending ON email_outbox(sent_at,next_attempt);
CREATE TABLE IF NOT EXISTS checkouts (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), price_id TEXT NOT NULL, days INTEGER NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS membership_payments (session_id TEXT PRIMARY KEY REFERENCES checkouts(id), member_id TEXT NOT NULL REFERENCES members(id), payment_intent TEXT NOT NULL, paid_at INTEGER NOT NULL, valid_until INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, review_reason TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS payments_member ON membership_payments(member_id,revoked,valid_until);
CREATE INDEX IF NOT EXISTS payments_intent ON membership_payments(payment_intent);
CREATE TABLE IF NOT EXISTS payment_events (id TEXT PRIMARY KEY, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS site_pages (
  slug TEXT PRIMARY KEY, content TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1, updated TEXT NOT NULL,
  updated_by TEXT NOT NULL REFERENCES members(id)
);
