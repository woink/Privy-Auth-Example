"use client";

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setState((prevState) => ({
      toasts: [...prevState.toasts, newToast],
    }));

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((t) => t.id !== id),
    }));
  }, []);

  const toast = useCallback(
    (props: Omit<Toast, "id">) => {
      return addToast(props);
    },
    [addToast]
  );

  return {
    toasts: state.toasts,
    toast,
    removeToast,
    success: (description: string, title?: string) =>
      toast({ description, title, variant: "success" }),
    error: (description: string, title?: string) =>
      toast({ description, title, variant: "destructive" }),
  };
}