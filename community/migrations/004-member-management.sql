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
ALTER TABLE email_outbox ADD COLUMN purpose TEXT NOT NULL DEFAULT 'confirmation';
CREATE TABLE IF NOT EXISTS password_reset_tokens (token_hash TEXT PRIMARY KEY,member_id TEXT NOT NULL REFERENCES members(id),expires INTEGER NOT NULL);
