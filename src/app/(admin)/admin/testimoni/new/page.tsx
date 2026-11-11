"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import TestimoniForm from '@/components/admin/TestimoniForm';

export default function NewTestimoniPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah Testimoni" />
      <TestimoniForm mode="create" />
    </div>
  );
}
