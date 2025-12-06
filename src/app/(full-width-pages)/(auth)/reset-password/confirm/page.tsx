import ResetPasswordConfirmForm from "@/components/auth/ResetPasswordConfirmForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Konfirmasi Reset Password | FSHI IAIN Bone",
  description: "Halaman konfirmasi reset password untuk admin Fakultas Syariah dan Hukum Islam IAIN Bone",
};

export default function ResetPasswordConfirm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordConfirmForm />
    </Suspense>
  );
}

