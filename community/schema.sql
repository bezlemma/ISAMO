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
CREATE TABLE IF NOT EXISTS email_outbox (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), recipient TEXT NOT NULL, body TEXT, created INTEGER NOT NULL, next_attempt INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER, last_error TEXT NOT NULL DEFAULT '', purpose TEXT NOT NULL DEFAULT 'confirmation');
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
CREATE TABLE IF NOT EXISTS manual_dues (
  id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id),
  kind TEXT NOT NULL CHECK(kind IN ('paid','waived')),
  amount INTEGER NOT NULL CHECK(amount>=0), currency TEXT NOT NULL,
  paid_at INTEGER NOT NULL, valid_until INTEGER NOT NULL, method TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL,
  created_by TEXT NOT NULL REFERENCES members(id),
  voided_at INTEGER, voided_by TEXT REFERENCES members(id), void_reason TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS manual_dues_member ON manual_dues(member_id,voided_at,valid_until);
CREATE TABLE IF NOT EXISTS member_emails (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('news','membership')),
  subject TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL,
  created_by TEXT NOT NULL REFERENCES members(id),
  state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','queued','cancelled')),
  queued_at INTEGER
);
CREATE TABLE IF NOT EXISTS member_email_recipients (
  id TEXT PRIMARY KEY, email_id TEXT NOT NULL REFERENCES member_emails(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id), recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed','skipped','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0,
  lease TEXT, sent_at INTEGER, last_error TEXT NOT NULL DEFAULT '',
  UNIQUE(email_id,member_id)
);
CREATE INDEX IF NOT EXISTS member_email_pending ON member_email_recipients(status,next_attempt);
CREATE INDEX IF NOT EXISTS member_email_history ON member_emails(created DESC);
CREATE TABLE IF NOT EXISTS password_reset_tokens (token_hash TEXT PRIMARY KEY,member_id TEXT NOT NULL REFERENCES members(id),expires INTEGER NOT NULL);
