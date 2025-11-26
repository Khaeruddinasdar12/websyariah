"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import { TrashBinIcon, PencilIcon } from '@/icons';

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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashBinIcon className="w-4 h-4" />
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

