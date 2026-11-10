import { sheetClass } from "@/components/styles";

type PanelProps = {
  title?: string;
  // a short line under the title
  description?: React.ReactNode;
  // buttons or links shown at the right of the title
  actions?: React.ReactNode;
  // "sunk" is for secondary information that should step back
  tone?: "sheet" | "sunk";
  as?: "section" | "div" | "article";
  headingLevel?: 2 | 3;
  className?: string;
  children?: React.ReactNode;
};

export function Panel({
  title,
  description,
  actions,
  tone = "sheet",
  as: Tag = "section",
  headingLevel = 2,
  className = "",
  children,
}: PanelProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const surface = tone === "sheet" ? sheetClass : "rounded-panel bg-sunk";
  const headingId = title ? `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;

  return (
    <Tag aria-labelledby={Tag === "section" ? headingId : undefined} className={`${surface} p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && (
              <Heading id={headingId} className="text-xl">
                {title}
              </Heading>
            )}
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
