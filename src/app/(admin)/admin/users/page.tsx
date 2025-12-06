"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import { TrashBinIcon, PencilIcon } from '@/icons';
import { renderIcon } from '@/utils/renderIcon';

interface User {
  id: number; // bigint (auto-increment)
  user_id: string; // UUID (foreign key to auth.users.id)
  nama: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export default function UsersPage() {
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

      // Get emails from auth.users using user_id (UUID), not id (bigint)
      const usersWithEmail = await Promise.all(
        (usersData || []).map(async (user) => {
          // Use user_id (UUID) to get auth user, not id (bigint)
          if (user.user_id) {
            try {
              const { data: authData } = await supabase.auth.admin.getUserById(user.user_id);
              return {
                ...user,
                email: authData?.user?.email || '',
              };
            } catch (error) {
              console.error(`Error fetching auth user for user_id ${user.user_id}:`, error);
              return {
                ...user,
                email: '',
              };
            }
          }
          return {
            ...user,
            email: '',
          };
        })
      );

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
    // Navigate to edit page
    window.location.href = `/admin/users/${user.id}/edit`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // Delete from users table using id (bigint)
      const { error: userError } = await supabase.from('users').delete().eq('id', id);
      if (userError) throw userError;

      // Note: Deleting from auth.users requires admin privileges
      // You might need to handle this server-side or through Supabase dashboard
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
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
              {users.map((user) => (
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
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors min-w-[32px] min-h-[32px]"
                        title="Edit"
                        aria-label="Edit user"
                      >
                        {renderIcon(PencilIcon, "w-4 h-4") || (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors min-w-[32px] min-h-[32px]"
                        title="Hapus"
                        aria-label="Hapus user"
                      >
                        {renderIcon(TrashBinIcon, "w-4 h-4") || (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}

