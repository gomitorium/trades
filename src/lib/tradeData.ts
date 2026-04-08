/** Gets the Data from the Google Sheet - this is rather ugly but damn does it work so good and fast and simple. Make sure to publish your google sheet for it to work.*/

import Papa from "papaparse";

export const CSV_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZBuIbXT_gR7YcEq5tBgOOI2QBNThjr6NqAkLo-AaDmBuH3o5wtWqBP537P-R58IgGbETnSQLbXumf/pub?output=csv";

export type TradingItem = {
    id: string; // generated as `${title}-${edition}-${master}`
    title: string;
    date: string;
    edition: string;
    cast: { name: string; role: string }[];
    master: string;
    masterNotes?: string;
    size: string;
    format: string;
    nftTil?: string;
    status: "TRADE" | "NFT" | "NEVER";
    personalNotes?: string;
}

type CSV_KEYS = "Cast" | "Date" | "Format" | "Location / Edition" | "Master" | "Master Notes" | "Name" | "NFT Til" | "Size" | "Trade Status" | "Personal Notes";

const fetchTradingData = async (): Promise<Record<CSV_KEYS, string>[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<CSV_KEYS, string>>(CSV_LINK, {
            download: true,
            header: true,
            worker: true,
            skipFirstNLines: 1, // I have like headers on the sheet and with it it jumbles the shit
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error(results.errors[0].message));
                } else {
                    resolve(results.data as Record<CSV_KEYS, string>[]);
                }
            },
            error: (error) => reject(error),
        });
    });
};

const mapRawToTradingItems = (data: Record<CSV_KEYS, string>[]): TradingItem[] => {
    const parseDate = (dateStr: string): Date => {
        const dateMatch = dateStr.match(/(\d{1,2})?\s*([A-Z][a-z]+)\s*,?\s*(\d{4})/);
        if (!dateMatch) return new Date(0);
        
        const day = dateMatch[1] ? parseInt(dateMatch[1]) : 1;
        const month = dateMatch[2];
        const year = dateMatch[3];
        
        return new Date(`${month} ${day}, ${year}`);
    };

    return data.map((row) => ({
        id: generateGuid(),
        title: row["Name"],
        date: row["Date"],
        edition: row["Location / Edition"],
        cast: row["Cast"].split(",").map((s) => {
            const trimmed = s.trim();
            const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
            if (match) {
                return { name: match[1].trim(), role: match[2].trim() };
            }
            // Fallback if format doesn't match expected "NAME (ROLE)"
            return { name: trimmed, role: "" };
        }),
        master: row["Master"],
        masterNotes: row["Master Notes"],
        size: row["Size"],
        format: row["Format"],
        nftTil: row["NFT Til"],
        status: row["Trade Status"] as TradingItem["status"],
        personalNotes: row["Personal Notes"],
    })).sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}

export const generateGuid = (): string => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

export const getTradingData = async (): Promise<TradingItem[]> => {
    const data = await fetchTradingData();
    const tradeItems = mapRawToTradingItems(data);
    return tradeItems;
}