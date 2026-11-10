// Empty, loading and error states. Every list and page uses these, so a
// blank screen always tells you what to do next.

import { buttonClass } from "@/components/styles";
import { BlankSheet, BrokenPencil } from "./doodles";

export function Spinner({ size = "md", label }: { size?: "sm" | "md"; label?: string }) {
  const dimension = size === "sm" ? "size-4 border-2" : "size-6 border-[3px]";
  return (
    <span
      // with a label it is announced, without one it is decoration next to text
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`${dimension} inline-block animate-[spin_0.8s_linear_infinite] rounded-full border-current border-r-transparent`}
      />
      {label && <span className="text-sm text-muted">{label}</span>}
    </span>
  );
}

// grey shape standing in for content that is still loading
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-[shimmer_1.6s_linear_infinite] rounded-control bg-[linear-gradient(90deg,var(--color-sunk)_30%,#fbf6ef_50%,var(--color-sunk)_70%)] bg-size-[200%_100%] ${className}`}
    />
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <p role="status" className="sr-only">
        {label}…
      </p>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  children?: React.ReactNode;
  // the one thing to do next, usually a link or a button
  action?: React.ReactNode;
};

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border-2 border-dashed border-blueline px-6 py-10 text-center">
      <BlankSheet className="w-24" />
      <h3 className="text-xl">{title}</h3>
      {children && <div className="max-w-sm text-muted">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

type ErrorStateProps = {
  title: string;
  children?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({ title, children, onRetry, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-panel bg-danger-soft px-6 py-10 text-center"
    >
      <BrokenPencil className="w-24" />
      <h3 className="text-xl">{title}</h3>
      {children && <div className="max-w-sm">{children}</div>}
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${buttonClass("secondary")} mt-2`}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
