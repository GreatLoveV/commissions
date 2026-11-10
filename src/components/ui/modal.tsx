"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  // buttons at the bottom, the main one last
  footer?: React.ReactNode;
};

// Built on the native <dialog>. showModal() makes the rest of the page
// unreachable, keeps focus inside, and closes on Escape for free.
export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // unique ids, so two dialogs on one page do not share a heading id
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape and the close button both end up here
      onClose={onClose}
      // a click on the dimmed backdrop lands on the dialog element itself
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-panel border border-line bg-sheet p-0 text-ink shadow-float
        opacity-0 scale-95 transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-out-soft
        open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95
        backdrop:bg-ink/40 backdrop:transition-[background-color] backdrop:duration-200"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-2xl">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-muted">
              {description}
            </p>
          )}
        </div>
        {children}
        {footer && <div className="mt-2 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </dialog>
  );
}
