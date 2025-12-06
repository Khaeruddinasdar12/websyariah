"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React, { useMemo } from "react";
import Link from "next/link";
import { DocsIcon, UserCircleIcon } from "@/icons";

export default function AdminDashboard() {
  // Memoize icon components to ensure they're always valid React components
  const DocsIconComponent = useMemo(() => {
    if (!DocsIcon) return null;
    const Component = (DocsIcon as any)?.default || DocsIcon;
    if (typeof Component === 'function') {
      return Component;
    }
    return null;
  }, []);

  const UserCircleIconComponent = useMemo(() => {
    if (!UserCircleIcon) return null;
    const Component = (UserCircleIcon as any)?.default || UserCircleIcon;
    if (typeof Component === 'function') {
      return Component;
    }
    return null;
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComponentCard title="Quick Actions">
          <div className="space-y-4">
            <Link
              href="/admin/beritas"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                {DocsIconComponent ? (
                  <DocsIconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                ) : (
                  <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                  Kelola Beritas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tambah, edit, atau hapus berita
                </p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                {UserCircleIconComponent ? (
                  <UserCircleIconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                ) : (
                  <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                  Kelola Users
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tambah, edit, atau hapus user
                </p>
              </div>
            </Link>
          </div>
        </ComponentCard>
        <ComponentCard title="Info">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Selamat datang di Admin Panel</p>
            <p>Gunakan menu di sidebar untuk navigasi.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
