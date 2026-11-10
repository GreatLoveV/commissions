// The stages of a commission drawn like a sketch being inked: finished
// stages are solid ink, the current one is circled in pink, the ones still
// to come are dashed blue pencil. Used on the request pages.
//
// Motion: the line leading up to the current stage inks itself from left
// to right once when the page opens (240ms, transform only). With reduced
// motion it is simply already inked.

export type Stage = { label: string };

export function StageLine({
  stages,
  current,
  label,
}: {
  stages: Stage[];
  // index of the stage the request is at now. stages.length means all done.
  current: number;
  label: string;
}) {
  const allDone = current >= stages.length;
  const captionIndex = Math.min(current, stages.length - 1);

  return (
    <div className="flex flex-col gap-2">
      <ol aria-label={label} className="flex w-full items-start">
        {stages.map((stage, index) => {
          const done = index < current;
          const now = index === current;
          const last = index === stages.length - 1;
          // the line from this stage to the next is inked once the next
          // stage has been reached
          const lineInked = index + 1 <= current && !last;
          const freshLine = index + 1 === current;
          return (
            <li
              key={stage.label}
              aria-current={now ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center gap-2 text-center"
            >
              {!last && (
                <span aria-hidden="true" className="absolute top-[0.6875rem] left-1/2 w-full">
                  <span className="block border-t-[3px] border-dashed border-blueline" />
                  {lineInked && (
                    <span
                      className={`absolute inset-x-0 top-0 block h-[3px] origin-left bg-ink ${
                        freshLine ? "animate-[ink-line_240ms_var(--ease-out-soft)_120ms_both]" : ""
                      }`}
                    />
                  )}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`relative grid size-6 place-items-center rounded-full border-[3px] ${
                  done
                    ? "border-ink bg-ink"
                    : now
                      ? "animate-[ink-dot_200ms_var(--ease-pop)_320ms_both] border-ink bg-pink ring-4 ring-pink-soft"
                      : "border-dashed border-blueline bg-sheet"
                }`}
              >
                {done && <span className="text-xs leading-none font-bold text-canvas">✓</span>}
              </span>
              {/* on a phone the labels do not fit under the dots, so only
                  screen readers get them and the caption below says where
                  the request is */}
              <span className={`sr-only text-xs sm:not-sr-only ${now ? "font-semibold text-ink" : "text-muted"}`}>
                {stage.label}
              </span>
              <span className="sr-only">
                {done ? ", done" : now ? ", current stage" : ", not started"}
              </span>
            </li>
          );
        })}
      </ol>
      <p aria-hidden="true" className="text-sm text-muted sm:hidden">
        {allDone ? (
          <span className="font-semibold text-ink">All done</span>
        ) : (
          <>
            Step {captionIndex + 1} of {stages.length}:{" "}
            <span className="font-semibold text-ink">{stages[captionIndex].label}</span>
          </>
        )}
      </p>
    </div>
  );
}
