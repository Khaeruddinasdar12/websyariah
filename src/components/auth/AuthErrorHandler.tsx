"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorHandler() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL hash (Supabase auth errors)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      
      const errorParam = hashParams.get('error');
      const errorDescriptionParam = hashParams.get('error_description');
      
      if (errorParam) {
        setError(errorParam);
        setErrorDescription(errorDescriptionParam);
        
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Also check for error in query params
      const urlParams = new URLSearchParams(window.location.search);
      const queryError = urlParams.get('error');
      const queryErrorDesc = urlParams.get('error_description');
      
      if (queryError) {
        setError(queryError);
        setErrorDescription(queryErrorDesc);
      }
    }
  }, []);

  if (!error) return null;

  const getErrorMessage = () => {
    if (error === 'access_denied' || error === 'otp_expired') {
      return {
        title: 'Link Verifikasi Expired',
        message: 'Link verifikasi email sudah kadaluarsa atau tidak valid. Silakan daftar ulang atau hubungi administrator.',
        action: 'Daftar Ulang',
        actionLink: '/signup',
      };
    }
    
    return {
      title: 'Error Autentikasi',
      message: errorDescription || 'Terjadi kesalahan saat proses autentikasi. Silakan coba lagi.',
      action: 'Kembali ke Login',
      actionLink: '/signin',
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white/90 mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {errorInfo.message}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={errorInfo.actionLink}
            className="flex-1 px-4 py-2 text-center text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            {errorInfo.action}
          </Link>
          <button
            onClick={() => {
              setError(null);
              setErrorDescription(null);
              router.push('/signin');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

