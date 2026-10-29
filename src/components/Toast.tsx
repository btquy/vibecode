import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

export const TOAST_DURATION = 3000;
export const TOAST_DURATION_WITH_ACTION = 5000;

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'error';
}

interface ToastState extends ToastOptions {
  id: number;
}

interface ToastApi {
  show: (options: ToastOptions) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Toast / Snackbar – DESIGN.md §6.13. Một toast tại một thời điểm, toast mới thay toast cũ. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback(() => setToast(null), []);
  const show = useCallback((options: ToastOptions) => {
    setToast({ ...options, id: nextId.current++ });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.actionLabel ? TOAST_DURATION_WITH_ACTION : TOAST_DURATION;
    const timer = window.setTimeout(() => setToast((t) => (t?.id === toast.id ? null : t)), duration);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`${styles.toast} ${toast.variant === 'error' ? styles.error : ''}`}>
            <span className={styles.message}>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return ctx;
}
