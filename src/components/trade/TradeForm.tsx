import { useRef, useState } from "react";
import { X } from "lucide-react";
import { summary } from "@/lib/data";
import type { TradingItem } from "@/lib/tradeData";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

interface TradeFormProps {
  selectedEntries: (TradingItem & { titleName: string })[];
  onRemoveSelected: (id: string) => void;
  onScrollToEntry: (id: string) => void;
  onSubmit: (data: { email: string; tradingListUrl: string; message: string }) => void;
  inAction: boolean;
}

export function TradeForm({
  selectedEntries,
  onRemoveSelected,
  onScrollToEntry,
  onSubmit,
  inAction,
}: TradeFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [tradingListUrl, setTradingListUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Submitting your trade request of ${selectedEntries.length} items...`);
    onSubmit({ email, tradingListUrl, message });
    setEmail("");
    setTradingListUrl("");
    setMessage("");
  };

  return (
    <div
      ref={formRef}
      className="border-t border-border pt-6 pb-10 space-y-5"
    >
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Submit a Trade Request
        </h2>
        <p className="text-sm text-muted-foreground">
          Tick the entries you want above, then complete the form below. All
          fields are required.
        </p>
      </div>

      {/* Selected entries preview */}
      {selectedEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your request ({selectedEntries.length})
          </p>
          <div className="space-y-1.5">
            {inAction ? (
              // Show skeleton loaders while submitting
              Array.from({ length: selectedEntries.length }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))
            ) : (
              // Show actual entries
              selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => onScrollToEntry(entry.id)}
                    className="text-xs text-left text-muted-foreground hover:text-foreground transition-colors leading-relaxed flex-1 min-w-0"
                    title="Click to jump to this entry"
                  >
                    {summary(entry)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSelected(entry.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    disabled={inAction}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    {inAction && (
    <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
    ) || 
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="trade-email"
            className="text-xs font-medium text-muted-foreground"
          >
            Your email <span className="text-[oklch(0.65_0.13_25)]">*</span>
          </label>
          <input
            id="trade-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>

        {/* Trading list URL */}
        <div className="space-y-1">
          <label
            htmlFor="trade-list-url"
            className="text-xs font-medium text-muted-foreground"
          >
            Link to your trading list{" "}
            <span className="text-[oklch(0.65_0.13_25)]">*</span>
          </label>
          <input
            id="trade-list-url"
            type="url"
            required
            value={tradingListUrl}
            onChange={(e) => setTradingListUrl(e.target.value)}
            placeholder="https://yoursite.com/trading-list or https://docs.google.com/spreadsheets/..."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label
            htmlFor="trade-message"
            className="text-xs font-medium text-muted-foreground"
          >
            Additional notes
          </label>
          <textarea
            id="trade-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
            rows={3}
            placeholder="Anything else you'd like to mention..."
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedEntries.length === 0 || inAction}
        >
          Send Request
          {selectedEntries.length > 0 && (
            <span className="ml-2 text-xs opacity-75">
              ({selectedEntries.length} title
              {selectedEntries.length !== 1 ? "s" : ""})
            </span>
          )}
        </button>
      </form>}
    </div>
  );
}
