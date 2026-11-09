"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/form";
import { CURRENCIES } from "@/lib/validation/artist";
import { updateProfile } from "../actions";

type Props = {
  profile: {
    handle: string;
    displayName: string;
    bio: string;
    currency: string;
  };
};

export function SettingsForm({ profile }: Props) {
  const [state, action] = useActionState(updateProfile, {});
  // after a submit, show what was submitted; before that, what is saved
  const values = state.values ?? profile;

  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      <Field
        label="Display name"
        name="displayName"
        defaultValue={values.displayName}
        errors={state.errors?.displayName}
      />
      <Field
        label="Handle"
        name="handle"
        autoComplete="off"
        hint="Changing this changes your public link. Old links stop working."
        defaultValue={values.handle}
        errors={state.errors?.handle}
      />
      <TextArea
        label="Bio"
        name="bio"
        hint="Up to 500 characters."
        defaultValue={values.bio}
        errors={state.errors?.bio}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="currency" className="text-sm font-medium">
          Currency for your prices
        </label>
        <select
          id="currency"
          name="currency"
          defaultValue={values.currency}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        {state.errors?.currency?.length ? (
          <p className="text-sm text-red-700">
            {state.errors.currency.join(". ")}
          </p>
        ) : null}
      </div>
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
