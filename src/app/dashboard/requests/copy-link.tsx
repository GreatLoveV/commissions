"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/styles";

// Lets the artist send the client their private link by hand, for example
// on Discord, when an email did not arrive.
export function CopyLink({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      // clipboard can be blocked, the field below can still be selected
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        readOnly
        value={url}
        aria-label="Client's private link"
        onFocus={(event) => event.currentTarget.select()}
        className={`${inputClass} text-sm`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={copy}>
          Copy link
        </Button>
        <p aria-live="polite" className="text-sm text-muted">
          {status === "copied" && "Copied"}
          {status === "failed" && "Could not copy, select the link and copy it"}
        </p>
      </div>
    </div>
  );
}
