"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/form";
import { inputClass } from "@/components/styles";
import { quote, recordPayment } from "./actions";

type QuoteProps = {
  requestId: string;
  currency: string;
  // the current quote as text, when one was already sent
  currentPrice?: string;
};

export function QuoteForm({ requestId, currency, currentPrice }: QuoteProps) {
  const [state, action] = useActionState(quote.bind(null, requestId), {});
  const values = state.values ?? { price: currentPrice ?? "", message: "" };

  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      <Field
        label={`Final price (${currency})`}
        name="price"
        inputMode="decimal"
        defaultValue={values.price}
        errors={state.errors?.price}
      />
      <TextArea
        label="Message to the client (optional)"
        name="message"
        hint="What the price includes, or anything you need from them."
        defaultValue={values.message}
        errors={state.errors?.message}
      />
      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <SubmitButton>{currentPrice ? "Send new quote" : "Send quote"}</SubmitButton>
      </div>
    </form>
  );
}

export function PaymentForm({ requestId, currency }: { requestId: string; currency: string }) {
  const [state, action] = useActionState(recordPayment.bind(null, requestId), {});
  // after a successful save the form starts empty again
  const values = state.ok ? {} : (state.values ?? {});
  const kindErrors = state.errors?.kind;

  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="kind" className="text-sm font-medium">
          Payment
        </label>
        <select
          // remount after each submit so the select shows the right value
          key={values.kind ?? "DEPOSIT"}
          id="kind"
          name="kind"
          defaultValue={values.kind ?? "DEPOSIT"}
          className={inputClass}
        >
          <option value="DEPOSIT">Deposit</option>
          <option value="FINAL">Final payment</option>
        </select>
        {kindErrors?.length ? (
          <p className="text-sm text-danger">{kindErrors.join(". ")}</p>
        ) : null}
      </div>
      <Field
        label={`Amount (${currency})`}
        name="amount"
        inputMode="decimal"
        defaultValue={values.amount}
        errors={state.errors?.amount}
      />
      <Field
        label="Note (optional)"
        name="note"
        hint="How it was paid, for example: bank transfer, PayPal."
        defaultValue={values.note}
        errors={state.errors?.note}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="paid"
          defaultChecked={values.paid === "on"}
          className="size-4 accent-accent"
        />
        <span>The client has already paid this</span>
      </label>
      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <SubmitButton>Record payment</SubmitButton>
      </div>
    </form>
  );
}
