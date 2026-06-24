"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePasswordAction(
  password: string,
  confirmPassword: string
): Promise<{ error?: string; success?: boolean }> {
  if (!password.trim()) {
    return { error: "Password harus diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  if (password !== confirmPassword) {
    return { error: "Password dan konfirmasi password tidak sama" };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "Sesi reset password tidak ditemukan atau sudah kadaluarsa. Silakan buka ulang link dari email Anda.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    const message = updateError.message || "Gagal mengubah password";

    if (message.toLowerCase().includes("auth session missing")) {
      return {
        error:
          "Sesi reset password tidak valid. Buka link terbaru dari email (jangan salin URL manual), dan pastikan link belum dibuka sebelumnya oleh aplikasi email.",
      };
    }

    return { error: message };
  }

  await supabase.auth.signOut();
  return { success: true };
}
