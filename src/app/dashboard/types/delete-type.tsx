"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteType } from "./actions";

// Deleting cannot be undone, so the button only opens a dialog. The real
// delete button is inside the dialog, which sits inside the form.
export function DeleteType({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(deleteType.bind(null, id), {});
  const [open, setOpen] = useState(false);

  return (
    <form
      action={() => {
        setOpen(false);
        action();
      }}
      className="flex flex-col items-start gap-3"
    >
      <p className="text-muted">
        Deleting removes this type for good. It only works if no client has
        requested it yet. To stop new requests without deleting, hide it
        instead.
      </p>
      <FormMessage message={state.message} />
      <Button variant="danger" loading={pending} onClick={() => setOpen(true)}>
        Delete this type
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete ${name}?`}
        description="This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button type="submit" variant="danger">
              Delete this type
            </Button>
          </>
        }
      />
    </form>
  );
}
