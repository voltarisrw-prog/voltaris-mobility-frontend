'use client';

export function ErrorState({
  title = 'This did not load',
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="border border-danger/25 bg-danger/5 px-6 py-12 text-center">
      <h2 className="font-display text-xl tracking-tight text-danger">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-steel">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border border-chrome px-5 py-2.5 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
        >
          Try again
        </button>
      )}
    </div>
  );
}
