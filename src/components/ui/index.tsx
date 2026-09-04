'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/format';

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'vds-button-primary',
  secondary: 'vds-button-secondary',
  ghost: 'vds-button-ghost',
  danger: 'vds-button-danger',
};

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'vds-button',
        BUTTON_STYLES[variant],
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Field */

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean;
    'aria-required': boolean;
  }) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>

      {hint && (
        <p id={hintId} className="mb-2 text-xs text-steel-muted">
          {hint}
        </p>
      )}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        'aria-required': Boolean(required),
      })}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'vds-input text-sm placeholder:text-white/40 aria-[invalid=true]:border-red-400';

export const selectClass =
  'vds-select text-sm aria-[invalid=true]:border-red-400';

/* ------------------------------------------------------------------- Toast */

interface Toast {
  id: number;
  tone: 'success' | 'error';
  message: string;
}

const ToastContext = createContext<{
  push: (tone: Toast['tone'], message: string) => void;
} | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback(
    (tone: Toast['tone'], message: string) => {
      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current,
        { id, tone, message },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id),
        );
      }, 6000);
    },
    [],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'vds-toast pointer-events-auto',
              toast.tone === 'success'
                ? 'vds-toast-success'
                : 'vds-toast-error',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                toast.tone === 'success'
                  ? 'bg-[#6A3717]'
                  : 'bg-red-400',
              )}
            />

            <span className="text-sm">
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used inside <ToastProvider>',
    );
  }

  return context;
}

/* -------------------------------------------------------------- Data table */

export interface Column<Row> {
  key: string;
  header: string;
  render: (row: Row) => React.ReactNode;
  align?: 'left' | 'right';
}

export function DataTable<Row>({
  rows,
  columns,
  caption,
  getRowKey,
  empty = 'Nothing here yet.',
}: {
  rows: Row[];
  columns: Column<Row>[];
  caption: string;
  getRowKey: (row: Row) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="vds-panel p-8 text-center text-sm text-steel">
        {empty}
      </div>
    );
  }

  return (
    <div className="vds-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">
            {caption}
          </caption>

          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'eyebrow whitespace-nowrap py-4 pr-4 text-left',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-white/[.06] last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'py-4 pr-4 align-middle',
                      column.align === 'right' && 'text-right',
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Skeleton */

export function LoadingSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('space-y-3', className)}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded-md bg-white/[.06]"
          style={{
            width: `${100 - index * 12}%`,
          }}
        />
      ))}
    </div>
  );
}
