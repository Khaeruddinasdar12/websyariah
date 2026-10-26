"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

interface User {
  id: number; // bigint (auto-increment)
  user_id: string; // UUID (foreign key to auth.users.id)
  nama: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch from users table and join with auth.users for email
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const { data: sessionData } = await supabase.auth.getSession();
      const currentAuthId = sessionData.session?.user.id;
      const currentEmail = sessionData.session?.user.email || '';

      const usersWithEmail = (usersData || []).map((user) => ({
        ...user,
        email: user.user_id && user.user_id === currentAuthId ? currentEmail : '',
      }));

      setUsers(usersWithEmail as User[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Fallback: just use users table data
      const { data, error: fallbackError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fallbackError && data) {
        setUsers(data as User[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = async (target: User) => {
    if (sessionUser?.id && target.user_id === sessionUser.id) {
      toast.showError('Tidak bisa menghapus', 'Akun yang sedang dipakai tidak dapat dihapus.');
      return;
    }

    const confirmed = await confirm({
      title: 'Hapus User',
      message: `Hapus ${target.nama}? Profil akan dihapus dari daftar pengguna.`,
      type: 'danger',
      confirmText: 'Hapus',
    });
    if (!confirmed) return;

    try {
      const { error: userError } = await supabase.from('users').delete().eq('id', target.id);
      if (userError) throw userError;
      toast.showSuccess('Berhasil', 'User berhasil dihapus');
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus user';
      toast.showError('Gagal menghapus', message);
    }
  };


  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Users Management" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Users Management" />
      <ComponentCard title="Users List">
        <div className="mb-4">
          <Link
            href="/admin/users/new"
            className="inline-block px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Add New User
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada user
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3">{user.nama}</td>
                  <td className="px-4 py-3">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <AdminTableActions
                      onEdit={() => handleEdit(user)}
                      onDelete={() => handleDelete(user)}
                      editLabel="Edit user"
                      deleteLabel="Hapus user"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

