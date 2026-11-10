// Plain tables with the house style. The wrapper scrolls sideways on a
// phone instead of squashing the columns, and can be reached by keyboard.

export function Table({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-panel border border-line bg-sheet">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, numeric = false }: { children?: React.ReactNode; numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={`bg-sunk px-4 py-3 font-semibold whitespace-nowrap text-muted first:pl-5 last:pr-5 ${numeric ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, numeric = false }: { children?: React.ReactNode; numeric?: boolean }) {
  return (
    <td
      className={`border-t border-line px-4 py-3 align-top first:pl-5 last:pr-5 ${numeric ? "text-right tabular-nums" : ""}`}
    >
      {children}
    </td>
  );
}
