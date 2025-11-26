"use client";

import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  isLoading: boolean;
  resolvePromise: ((value: boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    options: null,
    isLoading: false,
    resolvePromise: null,
  });

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options: opts,
        isLoading: false,
        resolvePromise: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.resolvePromise) {
      setState((prev) => ({ ...prev, isLoading: true }));
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));
      state.resolvePromise(true);
      setState({
        isOpen: false,
        options: null,
        isLoading: false,
        resolvePromise: null,
      });
    }
  }, [state.resolvePromise]);

  const handleCancel = useCallback(() => {
    if (state.resolvePromise) {
      state.resolvePromise(false);
      setState({
        isOpen: false,
        options: null,
        isLoading: false,
        resolvePromise: null,
      });
    }
  }, [state.resolvePromise]);

  return {
    confirm,
    isOpen: state.isOpen,
    options: state.options,
    isLoading: state.isLoading,
    handleConfirm,
    handleCancel,
  };
}

