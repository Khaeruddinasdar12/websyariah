-- Create storage bucket for pengumuman files (PDF, DOC, etc.)
-- Run this SQL in Supabase SQL Editor

-- Create a new bucket called 'files' for storing pengumuman files
-- Note: Bucket creation must be done through Supabase Dashboard or Storage API
-- This SQL is for reference only

-- Steps to create bucket manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: "files"
-- 4. Public: Yes (if you want public access)
-- 5. File size limit: Set as needed (e.g., 50MB)
-- 6. Allowed MIME types: Leave empty to allow all types, or specify:
--    - application/pdf
--    - application/msword
--    - application/vnd.openxmlformats-officedocument.wordprocessingml.document
--    - application/vnd.ms-excel
--    - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--    - image/* (if you want to allow images too)

-- Storage Policies for 'files' bucket
-- After creating the bucket, run these policies:

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'files')
WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files');

-- Allow public to read files (if bucket is public)
CREATE POLICY "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'files');

