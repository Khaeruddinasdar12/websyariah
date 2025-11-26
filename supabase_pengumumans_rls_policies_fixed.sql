-- Row Level Security Policies for pengumumans table
-- Run these SQL commands in your Supabase SQL Editor

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select pengumumans" ON pengumumans;
DROP POLICY IF EXISTS "Allow authenticated users to insert pengumumans" ON pengumumans;
DROP POLICY IF EXISTS "Allow authenticated users to update their own pengumumans" ON pengumumans;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own pengumumans" ON pengumumans;
DROP POLICY IF EXISTS "Allow public to select pengumumans" ON pengumumans;

-- Enable RLS on pengumumans table (if not already enabled)
ALTER TABLE pengumumans ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all pengumumans
CREATE POLICY "Allow authenticated users to select pengumumans"
ON pengumumans
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to INSERT pengumumans
-- This policy allows any authenticated user to insert, but checks that user_id matches
-- If user_id column is TEXT/VARCHAR, it will compare as text
-- If user_id column is UUID, it will compare as UUID
CREATE POLICY "Allow authenticated users to insert pengumumans"
ON pengumumans
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user_id matches authenticated user's UUID (as text)
  auth.uid()::text = user_id::text
  OR
  -- Allow if user_id is NULL (will be set by trigger or default)
  user_id IS NULL
);

-- Alternative: If you want to allow any authenticated user to insert (less restrictive)
-- Uncomment this and comment out the policy above:
-- CREATE POLICY "Allow authenticated users to insert pengumumans"
-- ON pengumumans
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE their own pengumumans
CREATE POLICY "Allow authenticated users to update their own pengumumans"
ON pengumumans
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Allow authenticated users to DELETE their own pengumumans
CREATE POLICY "Allow authenticated users to delete their own pengumumans"
ON pengumumans
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Allow public to SELECT pengumumans (for public pages)
CREATE POLICY "Allow public to select pengumumans"
ON pengumumans
FOR SELECT
TO public
USING (true);

