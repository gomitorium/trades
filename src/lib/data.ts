import { generateGuid, type TradingItem } from "./tradeData";

/** A collection is a grouping of recordings of the same show, e.g. "101 Dalmatians" or "42nd Street". Each collection has multiple entries which are the individual recordings. */
export type Collection = {
  title: string;
  id: string;
  expanded?: boolean;
  entries: TradingItem[];
}

/** Returns a pipe-separated summary string for a recording preview chip */
export const summary = (entry: TradingItem): string => {
  const meta = [entry.title, entry.edition, entry.date, entry.master, entry.format, entry.size]
    .filter(Boolean)
    .join(" | ");
  return meta;
}

export const summaryShort = (entry: TradingItem): string => {
  const meta = [entry.edition, entry.date, entry.master, entry.format, entry.size]
    .filter(Boolean)
    .join(" | ");
  return meta;
}

export const mapToCollections = (entries: TradingItem[]): Collection[] => {
    return entries.reduce((acc, entry) => {
        const existing = acc.find(c => c.title === entry.title);
        if (existing) {
            existing.entries.push(entry);
        } else {
            acc.push({ title: entry.title, entries: [entry], id: generateGuid(), expanded: false });
        }
        return acc;
    }, [] as Collection[]);
}

export const flattenCollections = (collections: Collection[]): (TradingItem & { titleName: string })[] => {
  return collections.flatMap(c => c.entries.map(e => ({ ...e, titleName: c.title })));
}
