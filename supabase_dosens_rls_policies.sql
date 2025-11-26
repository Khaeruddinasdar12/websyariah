-- Row Level Security Policies for dosens table
-- Run these SQL commands in your Supabase SQL Editor

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select dosens" ON dosens;
DROP POLICY IF EXISTS "Allow authenticated users to insert dosens" ON dosens;
DROP POLICY IF EXISTS "Allow authenticated users to update dosens" ON dosens;
DROP POLICY IF EXISTS "Allow authenticated users to delete dosens" ON dosens;
DROP POLICY IF EXISTS "Allow public to select dosens" ON dosens;

-- Enable RLS on dosens table (if not already enabled)
ALTER TABLE dosens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all dosens
CREATE POLICY "Allow authenticated users to select dosens"
ON dosens
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to INSERT dosens
CREATE POLICY "Allow authenticated users to insert dosens"
ON dosens
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE dosens
CREATE POLICY "Allow authenticated users to update dosens"
ON dosens
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE dosens
CREATE POLICY "Allow authenticated users to delete dosens"
ON dosens
FOR DELETE
TO authenticated
USING (true);

-- Allow public to SELECT dosens (for public pages)
CREATE POLICY "Allow public to select dosens"
ON dosens
FOR SELECT
TO public
USING (true);

