-- SEO fields for beritas (meta title, description, keywords)
-- Jalankan di Supabase Dashboard > SQL Editor

ALTER TABLE beritas
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

COMMENT ON COLUMN beritas.meta_title IS 'SEO meta title (override judul for search engines)';
COMMENT ON COLUMN beritas.meta_description IS 'SEO meta description for Google snippet';
COMMENT ON COLUMN beritas.meta_keywords IS 'Optional SEO keywords (comma-separated)';
