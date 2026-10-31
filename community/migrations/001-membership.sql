-- Apply once to the existing database before deploying the new Worker.
ALTER TABLE members ADD COLUMN role TEXT NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN research TEXT NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN mailing_list INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN mailing_updated TEXT NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN event_series TEXT NOT NULL DEFAULT 'other';
-- Then apply schema.sql to create the additional tables and indexes.
