"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form";
import { buttonClass, inputClass } from "@/components/styles";
import { move } from "./actions";

type Option = { to: string; label: string };

// On a board card: pick a column, then press Move. Two steps on purpose,
// so a request is not moved by one stray click.
export function MoveSelect({ requestId, options }: { requestId: string; options: Option[] }) {
  const [state, action, pending] = useActionState(move.bind(null, requestId), {});
  const selectId = `move-${requestId}`;

  return (
    <form action={action} className="flex flex-col gap-2">
      <label htmlFor={selectId} className="sr-only">
        Move this request to
      </label>
      {/* stacked: board columns are too narrow for them side by side */}
      <div className="flex flex-col gap-2">
        <select id={selectId} name="to" className={`${inputClass} py-1.5 pr-1 pl-2.5 text-sm`}>
          {options.map((option) => (
            <option key={option.to} value={option.to}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("secondary", "sm")}
        >
          Move
        </button>
      </div>
      <FormMessage message={state.message} />
    </form>
  );
}

// On the request page: one button per possible next step. The clicked
// button's value tells the action where to move.
export function MoveButtons({ requestId, options }: { requestId: string; options: Option[] }) {
  const [state, action, pending] = useActionState(move.bind(null, requestId), {});

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const ends = option.to === "CANCELLED" || option.to === "DECLINED";
          const style = `${buttonClass(ends ? "danger" : index === 0 ? "primary" : "secondary")} w-full`;
          return (
            <button
              key={option.to}
              type="submit"
              name="to"
              value={option.to}
              disabled={pending}
              className={style}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <FormMessage message={state.message} />
    </form>
  );
}
