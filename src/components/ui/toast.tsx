"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; message: string };

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

// Call useToast()("Saved") from any client component under the provider.
export function useToast() {
  return useContext(ToastContext);
}

const toneStyle: Record<Tone, { box: string; icon: string; label: string }> = {
  success: { box: "border-open", icon: "bg-open-soft text-open", label: "Done" },
  error: { box: "border-danger", icon: "bg-danger-soft text-danger", label: "Problem" },
  info: { box: "border-blueline", icon: "bg-blueline-soft text-accent-strong", label: "Note" },
};

const icons: Record<Tone, string> = { success: "✓", error: "!", info: "i" };

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = nextId++;
      setToasts((all) => [...all.slice(-2), { id, tone, message }]);
      // errors stay until closed, so they cannot be missed
      if (tone !== "error") setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* the live region is always on the page, so screen readers hear
          each new message as it is added */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((toast) => {
          const style = toneStyle[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : undefined}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control border-l-4 bg-sheet px-4 py-3 shadow-float transition-[opacity,translate] duration-200 ease-pop starting:translate-y-2 starting:opacity-0 ${style.box}`}
            >
              <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-full text-sm font-bold ${style.icon}`}>
                {icons[toast.tone]}
              </span>
              <p className="flex-1 text-sm">
                <span className="sr-only">{style.label}: </span>
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Dismiss</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
