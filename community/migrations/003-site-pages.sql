CREATE TABLE IF NOT EXISTS site_pages (
  slug TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated TEXT NOT NULL,
  updated_by TEXT NOT NULL REFERENCES members(id)
);
