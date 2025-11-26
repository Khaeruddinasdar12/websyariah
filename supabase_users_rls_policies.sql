-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to select users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON users;
DROP POLICY IF EXISTS "Allow public to select users" ON users;

-- Policy: Allow authenticated users to select all users
CREATE POLICY "Allow authenticated users to select users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert users
CREATE POLICY "Allow authenticated users to insert users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update users
CREATE POLICY "Allow authenticated users to update users"
ON users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete users
CREATE POLICY "Allow authenticated users to delete users"
ON users
FOR DELETE
TO authenticated
USING (true);

-- Optional: Allow public to select users (if needed for public pages)
-- CREATE POLICY "Allow public to select users"
-- ON users
-- FOR SELECT
-- TO public
-- USING (true);

