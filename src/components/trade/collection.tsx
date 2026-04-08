import { useState, useMemo, useEffect } from "react"
import { SearchBar } from "@/components/trade/searchbar"
import { CollectionRow } from "@/components/trade/entry"
import { TradeForm } from "@/components/trade/TradeForm"
import {
    mapToCollections,
    flattenCollections,
    type Collection,
    summary,
} from "@/lib/data"
import { getTradingData, type TradingItem } from "@/lib/tradeData"
import { Toaster } from "../ui/sonner"
import { toast } from "sonner"
import { Skeleton } from "../ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { AlertCircle } from "lucide-react"

export function CollectionPage() {
    const [query, setQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [rulesOpen, setRulesOpen] = useState(false)

    const [collections, setCollections] = useState<Collection[]>([])
    const [allEntries, setAllEntries] = useState<
        (TradingItem & { titleName: string })[]
    >([])

    const [inAction, setInAction] = useState(false)

    const loadData = async () => {
        const data = await getTradingData()
        setCollections(mapToCollections(data))
        setAllEntries(flattenCollections(mapToCollections(data)))
    }

    useEffect(() => {
        loadData();
    }, [])

    const filteredTitles = useMemo(() => {
        if (!query.trim()) return collections
        const lower = query.toLowerCase()
        return collections.filter((titleGroup) => {
            if (titleGroup.title.toLowerCase().includes(lower)) return true
            return titleGroup.entries.some(
                (entry) =>
                    entry.master.toLowerCase().includes(lower) ||
                    entry.edition.toLowerCase().includes(lower) ||
                    entry.format.toLowerCase().includes(lower) ||
                    entry.cast?.some(
                        (m) =>
                            m.name.toLowerCase().includes(lower) ||
                            m.role.toLowerCase().includes(lower)
                    )
            )
        })
    }, [query, collections])

    const isSearching = query.trim().length > 0

    const handleToggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleRemoveSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }

    // Im sorry this is a very shitty solution but it works and I have spent way too long on this already
    const scrollToEntry = (id: string) => {
        const el = document.getElementById(`entry-${id}`)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            el.classList.add("ring-1", "ring-primary")
            setTimeout(() => el?.classList.remove("ring-1", "ring-primary"), 1800)
            return
        }
        const collection = filteredTitles.find((c) =>
            c.entries.some((e) => e.id === id)
        )
        if (!collection) {
            //if entry is not found and collection is not found, it means the entry is hidden due to search query. We can clear the search query to show all entries, then scroll to the entry after a short delay
            const actualCollection = collections.find((c) =>
                c.entries.some((e) => e.id === id)
            )
            if (!actualCollection) return
            setQuery(actualCollection.title) // This will expand the right collection, then we can scroll to the entry after a short delay
            setTimeout(() => scrollToEntry(id), 100)
            return
        }
        //If entry is not found but collection is, it means the collection is collapsed. We can expand it by simulating a click on the section header, then scroll to the entry after a short delay
        const sectionEl = document.querySelector(
            `.section-${collection.id} > button`
        )
        if (!sectionEl) return
        ;(sectionEl as HTMLButtonElement).click()
        setTimeout(() => scrollToEntry(id), 100)
    }

    const selectedEntries = allEntries.filter((e) => selectedIds.has(e.id))

    const handleTradeFormSubmit = async (data: {
        email: string
        tradingListUrl: string
        message: string
    }) => {
        setInAction(true);
        console.log("Trade request submitted:", { selectedEntries, ...data })
        const entrySummaries = selectedEntries.map((e) => summary(e)).join(" ---- ")
        //yikes
        const url = "https://script.google.com/macros/s/AKfycbxXjHLL8Fkhr0s5sNG4hGt-8Pzt8m5PWt-MLnHPD2LzIC9gMnnPX_hitLr2-Eeben8wRg/exec"
        const payload = {
            email: data.email,
            tradelink: data.tradingListUrl,
            additionalmessage: data.message,
            requests: entrySummaries,
        }
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload),
        })
        try {
            const json = await res.json()
            console.log("Response from server:", json);
            if (json.status === "OK") {
                toast.success("Trade request submitted successfully! I will get back to you as soon as I can.")
                setSelectedIds(new Set()) // Clear selections after successful submission
            } else {
                toast.error("Failed to submit trade request. Please try again later.")
            }
        } catch (error) {
            console.error("Error parsing response:", error);
        }
        
        setInAction(false);
    }

    return (
        <main className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="font-sans text-3xl font-bold text-balance text-green-600">
                        gomitorium
                    </h1>
                    <h3 className="text-muted-foreground">trading list</h3>
                    <br />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Browse or search my bootlegs below. Select any you're interested in
                        and submit your trade request at the bottom.
                    </p>
                </div>

                {/* Rules box */}
                <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/5 px-5 py-4 hover:bg-yellow-500/10 transition-colors cursor-pointer group">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div className="flex-1 text-left">
                                <h3 className="text-sm font-semibold text-foreground">Important Rules & Information</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Click to read</p>
                            </div>
                            <span className={`text-xs text-muted-foreground transition-transform ${rulesOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                        <div className="rounded-md border border-border bg-card px-5 py-4 text-sm flex flex-col gap-3">
                            <span>I don't trade NFT boots!</span>
                            <span>If an item is marked as NFT, you cannot add it as a trade request.</span>
                            <span>1:1 trading is preferred, but I am open to offers so feel free to reach out!</span>
                            <span>Please ensure your trading list is accessible and that bootlink are preferably in MEGA format for easy viewing.</span>
                            <span>If you notice any errors or have any questions, please let me know!</span>
                            <span>You can reach me on Discord at @gomit or via email at gomit.jesting@gmail.com.</span>
                            <span className="text-muted-foreground">Shoutout to https://mazing2261.github.io/trading-list/ for whom I have took heavy inspiration for this trading site from.</span>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Search */}
                <SearchBar query={query} onQueryChange={setQuery} />

                {/* Flat list — no section groupings */}
                {isSearching && filteredTitles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No results found for &ldquo;{query}&rdquo;.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {(inAction || collections.length === 0) && 
                            Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))
                        
                        || filteredTitles.map((titleGroup) => (
                            <CollectionRow
                                key={titleGroup.title}
                                title={titleGroup}
                                defaultExpanded={isSearching}
                                selectedIds={selectedIds}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </div>
                )}

                {/* Trade request form */}
                <TradeForm
                    selectedEntries={selectedEntries}
                    onRemoveSelected={handleRemoveSelected}
                    onScrollToEntry={scrollToEntry}
                    onSubmit={handleTradeFormSubmit}
                    inAction={inAction}
                />
            </div>
            <Toaster />
        </main>
    )
}
