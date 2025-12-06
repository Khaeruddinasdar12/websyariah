"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { renderIcon } from "@/utils/renderIcon";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!email.trim()) {
      setError("Email harus diisi");
      setLoading(false);
      return;
    }

    try {
      // Get the current URL origin for redirect
      const redirectTo = `${window.location.origin}/reset-password/confirm`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectTo,
      });

      if (error) {
        setError(error.message || "Gagal mengirim email reset password");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {renderIcon(ChevronLeftIcon, "w-4 h-4 mr-1")}
          Kembali ke halaman masuk
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email Anda untuk menerima link reset password
            </p>
          </div>
          <div>
            {success ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  Email Terkirim!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Kami telah mengirimkan link reset password ke email{" "}
                  <strong>{email}</strong>. Silakan cek inbox Anda dan ikuti
                  instruksi di email tersebut.
                </p>
                <div className="mt-4">
                  <Link
                    href="/signin"
                    className="text-sm text-green-700 dark:text-green-400 hover:underline"
                  >
                    Kembali ke halaman masuk
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Masukkan email Anda"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Mengirim..." : "Kirim Link Reset Password"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

