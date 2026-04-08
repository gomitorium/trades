import { useState } from "react";
import { CheckIcon, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/data";
import { summary, summaryShort } from "@/lib/data";
import type { TradingItem } from "@/lib/tradeData";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CollectionRowProps {
  title: Collection;
  defaultExpanded?: boolean;
  isSearching?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

function EntryRow({
  entry,
  selected,
  onToggleSelect,
}: {
  entry: TradingItem;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (entry.status !== "NFT") onToggleSelect(entry.id);
  };

  const handleCopySummary = () => {
    const summaryText = summary(entry);
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast.info(`"${summaryText}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`entry-${entry.id}`}
      className={cn(
        "rounded border px-3 py-3 transition-colors space-y-2",
        selected && entry.status !== "NFT"
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-background"
      )}
    >
      {/* Top row: checkbox + label + link + badges */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selected && entry.status !== "NFT"}
            disabled={entry.status === "NFT"}
            onChange={handleCheck}
            className="accent-primary w-3.5 h-3.5 disabled:cursor-not-allowed"
          />
          <span
            className={cn(
              "text-sm text-foreground"
            )}
          >
            {entry.title}
          </span>
        </label>

        {entry.status === "NFT" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex", entry.nftTil && "-space-x-px")}>
                <span
                  className={cn(
                    "cursor-help text-xs px-1.5 py-0.5 rounded font-medium tracking-wide",
                    entry.nftTil ? "rounded-r-none" : "",
                    "bg-[oklch(0.25_0.08_25)] text-[oklch(0.70_0.14_25)] border border-[oklch(0.35_0.10_25)]"
                  )}
                >
                  NFT
                </span>
                {entry.nftTil && (
                  <span
                    className="cursor-help text-xs px-1.5 py-0.5 rounded-l-none rounded-r font-medium tracking-wide bg-[oklch(0.20_0.08_25)] text-[oklch(0.70_0.14_25)] border border-[oklch(0.35_0.10_25)]"
                  >
                    until {entry.nftTil}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {entry.nftTil ? `Not for Trade until ${entry.nftTil}` : "Not for Trade"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-start gap-2">
        <p className="text-xs text-shadow-muted-foreground leading-relaxed">
          {<span>{summaryShort(entry)}</span>}
        </p>
        <button
          onClick={handleCopySummary}
          className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
          title="Copy summary"
          aria-label="Copy summary"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Cast */}
      {entry.cast && entry.cast.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Cast</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {entry.cast.map((m) => `${m.name} (${m.role})`).join(", ")}
          </p>
        </div>
      )}

      {/* Master Notes */}
      {!!entry.masterNotes && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Master Notes</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {entry.masterNotes}
          </p>
        </div>
      )}

        {/* Personal Notes */}
      {!!entry.personalNotes && (
        <div className="bg-muted-foreground/10 border border-muted-foreground/30 rounded-md p-2">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">gomitorium Addendum:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {entry.personalNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export function CollectionRow({
  title,
  defaultExpanded = false,
  isSearching = false,
  selectedIds,
  onToggleSelect,
}: CollectionRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isExpanded = isSearching ? true : expanded;

  const hasSelected = title.entries.some(
    (e) => e.status !== "NFT" && selectedIds.has(e.id)
  );

  return (
    <div
      className={cn(
        "rounded-md border overflow-hidden transition-colors",
        hasSelected ? "border-primary/40" : "border-border",
        `section-${title.id}` // Use the collection's ID for the section ID
      )}
    >
      {/* Header — title only, no tags */}
      <button
        onClick={() => !isSearching && setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-card hover:bg-muted transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="text-sm text-foreground font-normal leading-snug">
          {title.title}
          {title.entries.length > 1 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({title.entries.length} recordings)
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 ml-3 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Sub-entries */}
      {isExpanded && (
        <div className="bg-card border-t border-border p-3 space-y-2">
          {title.entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              selected={selectedIds.has(entry.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
