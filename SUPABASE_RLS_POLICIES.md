# Supabase Row Level Security (RLS) Policies

## Masalah
Error: "new row violates row-level security policy for table 'beritas'"

## Solusi

### 1. Enable RLS pada Table

Pertama, pastikan RLS sudah di-enable pada table `beritas`:

```sql
-- Enable RLS
ALTER TABLE beritas ENABLE ROW LEVEL SECURITY;
```

### 2. Buat Policy untuk INSERT (Create)

Policy untuk mengizinkan authenticated users membuat berita baru:

```sql
-- Policy: Authenticated users can insert beritas
CREATE POLICY "Authenticated users can insert beritas"
ON beritas
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 3. Buat Policy untuk SELECT (Read)

Policy untuk mengizinkan semua user (termasuk public) membaca berita:

```sql
-- Policy: Everyone can read beritas
CREATE POLICY "Everyone can read beritas"
ON beritas
FOR SELECT
USING (true);
```

### 4. Buat Policy untuk UPDATE

Policy untuk mengizinkan authenticated users mengupdate berita (bisa dibatasi hanya yang mereka buat):

```sql
-- Option 1: Users can update their own beritas
CREATE POLICY "Users can update their own beritas"
ON beritas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Option 2: All authenticated users can update any berita (less secure)
-- CREATE POLICY "Authenticated users can update beritas"
-- ON beritas
-- FOR UPDATE
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);
```

### 5. Buat Policy untuk DELETE

Policy untuk mengizinkan authenticated users menghapus berita:

```sql
-- Option 1: Users can delete their own beritas
CREATE POLICY "Users can delete their own beritas"
ON beritas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Option 2: All authenticated users can delete any berita (less secure)
-- CREATE POLICY "Authenticated users can delete beritas"
-- ON beritas
-- FOR DELETE
-- TO authenticated
-- USING (true);
```

## Policy Lengkap untuk Table `beritas`

Jalankan semua SQL berikut di Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE beritas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (optional, untuk reset)
DROP POLICY IF EXISTS "Authenticated users can insert beritas" ON beritas;
DROP POLICY IF EXISTS "Everyone can read beritas" ON beritas;
DROP POLICY IF EXISTS "Users can update their own beritas" ON beritas;
DROP POLICY IF EXISTS "Users can delete their own beritas" ON beritas;

-- INSERT Policy: Authenticated users can create beritas
CREATE POLICY "Authenticated users can insert beritas"
ON beritas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- SELECT Policy: Everyone can read beritas (public access)
CREATE POLICY "Everyone can read beritas"
ON beritas
FOR SELECT
USING (true);

-- UPDATE Policy: Users can update their own beritas
CREATE POLICY "Users can update their own beritas"
ON beritas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy: Users can delete their own beritas
CREATE POLICY "Users can delete their own beritas"
ON beritas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Policy untuk Table `users`

Jika table `users` juga memerlukan RLS:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Everyone can read users (untuk menampilkan nama user)
CREATE POLICY "Everyone can read users"
ON users
FOR SELECT
USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## Catatan Penting

1. **user_id harus UUID**: Pastikan kolom `user_id` di table `beritas` adalah tipe UUID dan sesuai dengan `auth.users.id`

2. **Foreign Key**: Disarankan untuk membuat foreign key relationship:
   ```sql
   ALTER TABLE beritas
   ADD CONSTRAINT beritas_user_id_fkey
   FOREIGN KEY (user_id)
   REFERENCES auth.users(id)
   ON DELETE CASCADE;
   ```

3. **Test Policy**: Setelah membuat policy, test dengan:
   - Login sebagai user
   - Coba create berita baru
   - Coba update berita yang dibuat user tersebut
   - Coba delete berita yang dibuat user tersebut

## Troubleshooting

Jika masih error setelah membuat policy:

1. **Cek apakah RLS sudah enable**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'beritas';
   ```

2. **Cek policy yang ada**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'beritas';
   ```

3. **Pastikan user_id di berita sesuai dengan auth.uid()**:
   - Saat insert, pastikan `user_id` di-set ke `auth.uid()`
   - Kode sudah otomatis menggunakan `user.id` dari auth context

