"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer, { ToastContainerProps } from '@/components/ui/toast/ToastContainer';
import { ToastType } from '@/components/ui/toast/Toast';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message: string, duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('success', title, message, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('error', title, message, duration || 7000); // Error toasts last longer
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('warning', title, message, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('info', title, message, duration);
    },
    [showToast]
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: removeToast,
        }))}
        onClose={removeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

