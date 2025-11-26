"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React from "react";
import Link from "next/link";
import { DocsIcon, UserCircleIcon } from "@/icons";

export default function AdminDashboard() {
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
                <DocsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
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
                <UserCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
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
