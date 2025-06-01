"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (description: string, title?: string) => string;
  error: (description: string, title?: string) => string;
}

const ToastContext = createContext<ToastState | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

let toastCount = 0;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (props: Omit<Toast, "id">) => {
      return addToast(props);
    },
    [addToast],
  );

  const success = useCallback(
    (description: string, title?: string) =>
      toast({ description, title, variant: "success" }),
    [toast],
  );

  const error = useCallback(
    (description: string, title?: string) =>
      toast({ description, title, variant: "destructive" }),
    [toast],
  );

  const value: ToastState = {
    toasts,
    toast,
    removeToast,
    success,
    error,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}