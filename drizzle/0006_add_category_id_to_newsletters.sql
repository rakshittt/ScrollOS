ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS category_id integer REFERENCES categories(id);
-- Optionally, migrate existing data here if needed 