-- Optional catalog enhancements. Run with a database role allowed to install extensions.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS medicine_aliases (
  medicine_id INTEGER NOT NULL,
  alias VARCHAR(255) NOT NULL,
  PRIMARY KEY (medicine_id, alias)
);

CREATE INDEX IF NOT EXISTS medicine_aliases_alias_lower_idx
  ON medicine_aliases (LOWER(alias));
