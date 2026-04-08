import { useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onQueryChange: (query: string) => void;
  query: string;
}

export function SearchBar({ onQueryChange, query }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
  };

  const handleClear = () => {
    onQueryChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search by title or cast (or master, or venue, or anything really lol)"
          className="w-full bg-card border border-border rounded-md pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          role="combobox"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
