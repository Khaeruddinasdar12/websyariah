-- Row Level Security Policies for kategoris table
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS on kategoris table (if not already enabled)
ALTER TABLE kategoris ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all kategoris
CREATE POLICY "Allow authenticated users to select kategoris"
ON kategoris
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to INSERT kategoris
CREATE POLICY "Allow authenticated users to insert kategoris"
ON kategoris
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE kategoris
CREATE POLICY "Allow authenticated users to update kategoris"
ON kategoris
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE kategoris
CREATE POLICY "Allow authenticated users to delete kategoris"
ON kategoris
FOR DELETE
TO authenticated
USING (true);

-- If you want to allow public read access (for public pages), uncomment this:
-- CREATE POLICY "Allow public to select kategoris"
-- ON kategoris
-- FOR SELECT
-- TO public
-- USING (true);

