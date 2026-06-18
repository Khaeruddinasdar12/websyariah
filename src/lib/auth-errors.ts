const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials':
    'Email atau password salah. Jika Anda baru mereset akun, gunakan "Lupa password?" untuk mengatur password baru terlebih dahulu.',
  'Email not confirmed':
    'Email belum diverifikasi. Silakan cek inbox Anda atau hubungi administrator.',
  invalid_credentials:
    'Email atau password salah. Pastikan password sudah diatur melalui link reset password.',
};

export function getAuthErrorMessage(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? AUTH_ERROR_MESSAGES[message.toLowerCase()] ?? message;
}
