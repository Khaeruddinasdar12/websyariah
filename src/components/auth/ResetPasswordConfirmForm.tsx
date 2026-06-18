"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { renderIcon } from "@/utils/renderIcon";

function cleanupAuthUrl() {
  window.history.replaceState(null, "", window.location.pathname);
}

async function hasActiveSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

async function establishRecoverySession(): Promise<boolean> {
  if (await hasActiveSession()) {
    cleanupAuthUrl();
    return true;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && (await hasActiveSession())) {
      cleanupAuthUrl();
      return true;
    }
    // Code may have been exchanged already by another listener
    if (await hasActiveSession()) {
      cleanupAuthUrl();
      return true;
    }
    return false;
  }

  if (tokenHash && type === "recovery") {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (!error && data.session) {
      cleanupAuthUrl();
      return true;
    }
    return false;
  }

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const hashType = hashParams.get("type");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && hashType === "recovery" && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!error && data.session) {
        cleanupAuthUrl();
        return true;
      }
      return false;
    }
  }

  return hasActiveSession();
}

export default function ResetPasswordConfirmForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        if (
          session &&
          (event === "PASSWORD_RECOVERY" ||
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED")
        ) {
          setIsValidToken(true);
          cleanupAuthUrl();
        }
      }
    );

    const init = async () => {
      // Allow Supabase client and auth/callback cookies to settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!active) return;

      const valid = await establishRecoverySession();
      if (!active) return;

      if (valid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setError(
          "Link reset password tidak valid atau sudah kadaluarsa. Silakan request reset password baru."
        );
      }
    };

    init();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!password.trim()) {
      setError("Password harus diisi");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "Sesi reset password tidak ditemukan. Silakan buka ulang link dari email Anda."
        );
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Gagal mengubah password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = "/signin?reset=success";
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah password";
      setError(message);
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Memvalidasi link reset password...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
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
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
              Link Tidak Valid
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {error ||
                "Link reset password tidak valid atau sudah kadaluarsa. Silakan request reset password baru."}
            </p>
            <Link
              href="/reset-password"
              className="text-sm text-red-700 dark:text-red-400 hover:underline"
            >
              Request reset password baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Masukkan password baru Anda
            </p>
          </div>
          <div>
            {success ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  Password Berhasil Diubah!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman masuk...
                </p>
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
                      Password Baru <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          renderIcon(EyeIcon, "fill-gray-500 dark:fill-gray-400")
                        ) : (
                          renderIcon(EyeCloseIcon, "fill-gray-500 dark:fill-gray-400")
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>
                      Konfirmasi Password Baru <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Konfirmasi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          renderIcon(EyeIcon, "fill-gray-500 dark:fill-gray-400")
                        ) : (
                          renderIcon(EyeCloseIcon, "fill-gray-500 dark:fill-gray-400")
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" type="submit" disabled={loading}>
                      {loading ? "Mengubah Password..." : "Ubah Password"}
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
