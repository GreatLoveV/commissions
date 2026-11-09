"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form";
import { buttonDanger } from "@/components/styles";
import { deleteType } from "./actions";

export function DeleteType({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteType.bind(null, id), {});

  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <p className="text-muted">
        Deleting removes this type for good. It only works if no client has
        requested it yet.
      </p>
      <FormMessage message={state.message} />
      <button type="submit" disabled={pending} className={buttonDanger}>
        Delete this type
      </button>
    </form>
  );
}
