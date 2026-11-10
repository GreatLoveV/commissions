// The stages of a commission drawn like a sketch being inked: finished
// stages are solid ink, the current one is circled, the ones still to come
// are dashed blue pencil. Used on the board and the client's timeline.

export type Stage = { label: string };

export function StageLine({
  stages,
  current,
  label,
}: {
  stages: Stage[];
  // index of the stage the request is at now
  current: number;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
    <ol aria-label={label} className="flex w-full items-start">
      {stages.map((stage, index) => {
        const done = index < current;
        const now = index === current;
        const last = index === stages.length - 1;
        return (
          <li
            key={stage.label}
            aria-current={now ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute top-[0.6875rem] left-1/2 h-0 w-full border-t-[3px] ${
                  done ? "border-solid border-ink" : "border-dashed border-blueline"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative grid size-6 place-items-center rounded-full border-[3px] ${
                done
                  ? "border-ink bg-ink"
                  : now
                    ? "border-ink bg-pink ring-4 ring-pink-soft"
                    : "border-blueline border-dashed bg-sheet"
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
        Step {Math.min(current + 1, stages.length)} of {stages.length}:{" "}
        <span className="font-semibold text-ink">{stages[Math.min(current, stages.length - 1)].label}</span>
      </p>
    </div>
  );
}
