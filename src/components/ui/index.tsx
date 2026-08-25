'use client';

import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import { cn } from '@/lib/format';

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-volt hover:bg-volt-bright disabled:bg-hairline disabled:text-steel-muted',
  secondary: 'border border-chrome text-chrome hover:bg-chrome hover:text-surface',
  ghost: 'border border-hairline text-steel hover:border-chrome hover:text-chrome',
  danger: 'bg-danger text-surface hover:opacity-90',
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
      // aria-busy rather than swapping the label, so the accessible name is stable.
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-3 font-data text-eyebrow uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
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

/**
 * One wrapper owns the label/description/error wiring, so every input in the product
 * gets `aria-describedby` and `aria-invalid` right without each form remembering to.
 */
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
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

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
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full border border-hairline panel-field px-4 py-3 text-sm placeholder:text-steel-muted focus:border-volt aria-[invalid=true]:border-danger';

export const selectClass =
  'w-full border border-hairline panel-field px-4 py-3 text-sm focus:border-volt aria-[invalid=true]:border-danger';

/* ------------------------------------------------------------------- Toast */

interface Toast {
  id: number;
  tone: 'success' | 'error';
  message: string;
}

const ToastContext = createContext<{ push: (tone: Toast['tone'], message: string) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 6000);
  }, []);

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
              'pointer-events-auto px-4 py-3 text-sm text-surface shadow-lg',
              toast.tone === 'success' ? 'bg-volt' : 'bg-danger',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
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
      <p className="border border-dashed border-hairline p-8 text-center text-sm text-steel">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-chrome">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'eyebrow whitespace-nowrap py-3 pr-4 text-left',
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
            <tr key={getRowKey(row)} className="border-b border-hairline/60">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('py-3 pr-4 align-middle', column.align === 'right' && 'text-right')}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- Skeleton */

export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse bg-slab"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
