-- Row Level Security Policies for pengumumans table
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS on pengumumans table (if not already enabled)
ALTER TABLE pengumumans ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all pengumumans
CREATE POLICY "Allow authenticated users to select pengumumans"
ON pengumumans
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to INSERT pengumumans (only their own)
-- Note: This policy checks that user_id matches the authenticated user's UUID
-- If user_id column is TEXT/VARCHAR, use: auth.uid()::text = user_id
-- If user_id column is UUID, use: auth.uid() = user_id
CREATE POLICY "Allow authenticated users to insert pengumumans"
ON pengumumans
FOR INSERT
TO authenticated
WITH CHECK (
  CASE 
    WHEN user_id IS NULL THEN false
    ELSE auth.uid()::text = user_id::text
  END
);

-- Policy: Allow authenticated users to UPDATE their own pengumumans
CREATE POLICY "Allow authenticated users to update their own pengumumans"
ON pengumumans
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Allow authenticated users to DELETE their own pengumumans
CREATE POLICY "Allow authenticated users to delete their own pengumumans"
ON pengumumans
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow public to SELECT pengumumans (for public pages)
CREATE POLICY "Allow public to select pengumumans"
ON pengumumans
FOR SELECT
TO public
USING (true);

