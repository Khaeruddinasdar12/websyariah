"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

export default function NewUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [formData, setFormData] = useState({ nama: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.nama.trim()) {
      toast.showError('Validasi Gagal', 'Nama harus diisi');
      return;
    }
    if (!formData.email.trim()) {
      toast.showError('Validasi Gagal', 'Email harus diisi');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.showError('Validasi Gagal', 'Password minimal 6 karakter');
      return;
    }

    const confirmed = await confirm({
      title: 'Tambah User Baru',
      message: 'Apakah Anda yakin ingin menambahkan user baru?',
      type: 'info',
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      console.log('Creating user with email:', formData.email);
      
      // Create new user (sign up)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Don't send confirmation email
          data: {
            nama: formData.nama.trim(),
          },
        },
      });

      console.log('Auth response:', { user: authData?.user?.id, error: authError });

      if (authError) {
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          error: authError,
        });
        
        let errorMessage = 'Gagal membuat akun user';
        if (authError.message) {
          errorMessage = authError.message;
        } else if (authError.status === 400) {
          errorMessage = 'Email atau password tidak valid';
        } else if (authError.status === 422) {
          errorMessage = 'Format email tidak valid';
        }
        
        throw new Error(errorMessage);
      }

      if (!authData || !authData.user) {
        console.error('No user returned from signUp');
        throw new Error('User tidak berhasil dibuat. Silakan coba lagi.');
      }

      console.log('Creating user profile for:', authData.user.id);

      // Create user profile
      // The users table has:
      // - id: bigint (auto-increment, primary key)
      // - user_id: UUID (foreign key to auth.users.id)
      // - nama: string
      const { error: profileError, data: profileData } = await supabase
        .from('users')
        .insert({
          user_id: authData.user.id, // UUID from auth.users
          nama: formData.nama.trim(),
          // id will auto-increment
        })
        .select();

      console.log('Profile response:', { data: profileData, error: profileError });

      if (profileError) {
        console.error('Profile error:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          error: JSON.stringify(profileError, Object.getOwnPropertyNames(profileError)),
        });
        
        // Better error message extraction
        let errorMessage = 'Gagal membuat profil user';
        if (profileError.message) {
          errorMessage = profileError.message;
        } else if (profileError.code === '42501') {
          errorMessage = 'Tidak memiliki izin untuk menambahkan user. Periksa Row Level Security (RLS) policy. Jalankan script SQL: supabase_users_rls_policies.sql';
        } else if (profileError.code === '23505') {
          errorMessage = 'User dengan data ini sudah ada';
        } else if (profileError.code === '23502') {
          errorMessage = 'Field wajib tidak terisi';
        } else if (profileError.code) {
          errorMessage = `Error ${profileError.code}: ${profileError.message || 'Terjadi kesalahan'}`;
        } else {
          // If error object is empty, it's likely an RLS policy issue
          errorMessage = 'Tidak memiliki izin untuk menambahkan user. Pastikan Row Level Security (RLS) policy sudah dikonfigurasi. Jalankan script SQL: supabase_users_rls_policies.sql';
        }
        
        throw new Error(errorMessage);
      }

      console.log('User created successfully');
      toast.showSuccess('Berhasil', 'User berhasil ditambahkan');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error saving user - Full error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      
      // Better error message extraction
      let errorMessage = 'Terjadi kesalahan saat menambahkan user';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString();
      } else if (error) {
        // Try to extract meaningful information
        if (error.code) {
          errorMessage = `Error ${error.code}: ${error.message || 'Terjadi kesalahan'}`;
        } else if (error.status) {
          errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
        } else {
          // Try JSON stringify for complex objects
          try {
            const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
            if (errorStr !== '{}' && errorStr !== 'null' && errorStr.length > 2) {
              errorMessage = `Error: ${errorStr.substring(0, 200)}`; // Limit length
            } else {
              // If error object is empty, it's likely an RLS policy issue
              errorMessage = 'Tidak memiliki izin untuk menambahkan user. Pastikan Row Level Security (RLS) policy sudah dikonfigurasi dengan benar.';
            }
          } catch (e) {
            // If stringify fails, provide generic message
            errorMessage = 'Terjadi kesalahan saat menambahkan user. Periksa console untuk detail lebih lanjut.';
          }
        }
      }
      
      toast.showError('Gagal menambahkan user', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah User Baru" />
      <ComponentCard title="Form Tambah User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              Nama <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password minimal 6 karakter
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            >
              Batal
            </Link>
          </div>
        </form>
      </ComponentCard>
      {options && (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

