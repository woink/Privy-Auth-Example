"use client";

import { useToast } from "@/hooks/useToast";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toast() {
  const { toasts, removeToast } = useToast();
  const [visibleToasts, setVisibleToasts] = useState<typeof toasts>([]);

  useEffect(() => {
    setVisibleToasts(toasts);
  }, [toasts]);

  if (visibleToasts.length === 0) {
    return null;
  }

  const getIcon = (variant: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "destructive":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200";
      case "destructive":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg
            animate-in slide-in-from-right-full duration-300
            ${getStyles(toast.variant || "default")}
          `}
        >
          {getIcon(toast.variant || "default")}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <div className="font-medium text-sm mb-1">{toast.title}</div>
            )}
            <div className="text-sm">{toast.description}</div>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
