"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { renderIcon } from "@/utils/renderIcon";

export default function ResetPasswordConfirmForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a valid session from the reset password link
    const checkSession = async () => {
      try {
        // First, check URL hash for access token (Supabase includes it in the hash)
        // Format: #access_token=...&type=recovery&refresh_token=...
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && type === 'recovery' && refreshToken) {
            // Exchange the token for a session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              setIsValidToken(false);
              setError("Link reset password tidak valid atau sudah kadaluarsa");
              return;
            }
            
            if (data.session) {
              setIsValidToken(true);
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          }
        }
        
        // If no hash, check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setError("Link reset password tidak valid atau sudah kadaluarsa. Silakan request reset password baru.");
        }
      } catch (err: any) {
        setIsValidToken(false);
        setError("Terjadi kesalahan saat memvalidasi link reset password");
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
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
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message || "Gagal mengubah password");
      } else {
        setSuccess(true);
        // Redirect to signin after 2 seconds
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengubah password");
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Memvalidasi link reset password...</p>
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
              {error || "Link reset password tidak valid atau sudah kadaluarsa. Silakan request reset password baru."}
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
                    <Button className="w-full" size="sm" disabled={loading}>
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

