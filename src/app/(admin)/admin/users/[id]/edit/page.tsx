"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

interface UserProfile {
  id: number;
  user_id: string;
  nama: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isSelf = Boolean(profile?.user_id && user?.id && profile.user_id === user.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, user_id, nama')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setProfile(data);
        setNama(data.nama || '');
        setEmail(data.user_id === user.id ? user.email || '' : '');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal memuat data user';
        showError('Gagal memuat user', message);
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, userId, router, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      showError('Validasi Gagal', 'Nama harus diisi');
      return;
    }
    if (password && password.length < 6) {
      showError('Validasi Gagal', 'Password baru minimal 6 karakter');
      return;
    }
    if (isSelf && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError('Validasi Gagal', 'Format email tidak valid');
      return;
    }

    const confirmed = await confirm({
      title: 'Simpan Perubahan',
      message: 'Apakah Anda yakin ingin menyimpan perubahan user ini?',
      type: 'info',
    });
    if (!confirmed || !profile) return;

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('users')
        .update({ nama: nama.trim() })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      if (isSelf && password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }

      if (isSelf && email.trim() && email.trim() !== (user?.email || '')) {
        const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
        if (emailError) throw emailError;
        showSuccess(
          'Berhasil',
          'Nama disimpan. Jika email berubah, periksa kotak masuk untuk konfirmasi alamat baru.'
        );
      } else {
        showSuccess('Berhasil', 'User berhasil diperbarui');
      }

      router.push('/admin/users');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui user';
      showError('Gagal menyimpan', message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit User" />
        <div className="text-center py-10">Memuat data user...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit User" />
      <ComponentCard title="Form Edit User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              Nama <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving || !isSelf}
              placeholder={isSelf ? 'Email akun' : 'Email hanya bisa diubah pada akun yang sedang masuk'}
            />
            {!isSelf && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email akun lain tidak ditampilkan dari sini. Ubah email lewat akun yang sedang masuk.
              </p>
            )}
          </div>

          <div>
            <Label>Password baru</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving || !isSelf}
              minLength={6}
              placeholder={isSelf ? 'Kosongkan jika tidak ingin mengubah password' : 'Hanya akun yang sedang masuk'}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isSelf
                ? 'Kosongkan jika password tidak diubah. Minimal 6 karakter.'
                : 'Password akun lain tidak dapat diubah dari sesi ini.'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
