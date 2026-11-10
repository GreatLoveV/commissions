"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form";
import { buttonPrimary, buttonSecondary } from "@/components/styles";
import { answer } from "./actions";

export function AnswerForm({ token, priceMinor }: { token: string; priceMinor: number }) {
  const [state, action, pending] = useActionState(answer.bind(null, token), {});

  return (
    <form action={action} className="flex flex-col gap-3">
      {/* the price on screen right now. The server refuses the answer if
          the artist has changed the quote since this page was loaded. */}
      <input type="hidden" name="seenPrice" value={priceMinor} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="answer"
          value="approve"
          disabled={pending}
          className={buttonPrimary}
        >
          Approve quote
        </button>
        <button
          type="submit"
          name="answer"
          value="decline"
          disabled={pending}
          className={buttonSecondary}
        >
          Decline quote
        </button>
      </div>
      <FormMessage message={state.message} />
    </form>
  );
}
