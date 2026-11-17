import { useCallback, useEffect, useState } from "react";
import type { ShowToast } from "../types";

export type ToastState = { text: string; type: "success" | "error" };

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback<ShowToast>((text, type = "success") => {
    setToast({ text, type });
  }, []);
  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(hideToast, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, hideToast]);

  return { toast, showToast, hideToast };
}
