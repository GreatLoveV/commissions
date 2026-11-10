"use client";

// The interactive parts of the component page: they need state.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ErrorState } from "@/components/ui/states";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { inputClass } from "@/components/styles";

function ToastButtons() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast("Quote sent to Mira")}>
        Show success toast
      </Button>
      <Button variant="secondary" onClick={() => toast("Commission types are sorted by price", "info")}>
        Show info toast
      </Button>
      <Button variant="secondary" onClick={() => toast("The image is over 4 MB. Pick a smaller one.", "error")}>
        Show error toast
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open a form dialog
      </Button>
      <Button variant="danger" onClick={() => setDeclineOpen(true)}>
        Decline request
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send a quote"
        description="Mira sees this price on her request page and can approve it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Send quote</Button>
          </>
        }
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Price in USD</span>
          <input className={inputClass} inputMode="decimal" defaultValue="85.00" />
        </label>
      </Modal>

      <Modal
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        title="Decline this request?"
        description="Mira gets an email saying you can't take it. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeclineOpen(false)}>
              Keep request
            </Button>
            <Button variant="danger" onClick={() => setDeclineOpen(false)}>
              Decline request
            </Button>
          </>
        }
      />
    </div>
  );
}

export function ErrorDemo() {
  return (
    <ErrorState title="Your requests could not load" onRetry={() => {}}>
      Nothing was lost. Check your connection and try again.
    </ErrorState>
  );
}
