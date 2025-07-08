import PQueue from "p-queue";
import { MIN_VOLUME } from "./config";

/**
 * Interface for company stock data from FMP API.
 */
interface CompanyStockData {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  exchangeShortName: string;
  country: string;
  isEtf: boolean;
  isFund: boolean;
  isActivelyTrading: boolean;
}

interface SymbolReponse {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

/**
 * Base URL for the FMP API.
 */
const FMP_BASE_URL = "https://financialmodelingprep.com/";

// 1 hour
const CACHE_DURATION = 1000 * 60 * 60;

/**
 * Queue for fetching data.
 */
const queue = new PQueue({
  concurrency: 1, // Only 1 fetch at a time
  interval: 60_000, // 1 minute
  intervalCap: 60, // Max 60 fetches per minute
});

/**
 * Convert a record of parameters to a query string.
 * @param params - The parameters to convert to a query string.
 * @returns The query string.
 */
export function toQueryString(
  params: Record<string, string | number | boolean>
) {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

/**
 * Fetch data from the given URL.
 * @param url - The URL to fetch data from.
 * @param options - The options to pass to the fetch function.
 * @returns The data from the URL.
 */
async function fetchData<DataType>(
  url: string,
  options?: RequestInit
): Promise<DataType> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return response.json() as Promise<DataType>;
}

const cache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Fetch data from the given URL and cache the result.
 * @param url - The URL to fetch data from.
 * @param options - The options to pass to the fetch function.
 * @returns The data from the URL.
 */
async function cachedFetch<DataType = unknown>(
  url: string,
  options?: RequestInit
): Promise<DataType> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as Promise<DataType>;
  }

  const data = await fetchData(url, options);
  cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_DURATION });
  console.log("- Cached:", cacheKey);
  return data as Promise<DataType>;
}

/**
 * Fetch data from the FMP API.
 * @param path - The path to fetch data from.
 * @param options - The options to pass to the fetch function.
 * @returns The data from the FMP API.
 */
export function fmpFetch<DataType = unknown>(
  path: string,
  options?: RequestInit
): Promise<DataType> {
  return queue.add(() => {
    const addSymbol = path.includes("?") ? "&" : "?";
    return cachedFetch(
      FMP_BASE_URL + path + addSymbol + `apikey=${process.env.FMP_API_KEY}`,
      options
    );
  }) as Promise<DataType>;
}

async function main() {
  const aaplSymbols = await fmpFetch<SymbolReponse[]>(
    "stable/search-symbol?query=AAPL"
  );
  console.log("AAPL Search:", aaplSymbols);

  const companies = await fmpFetch<CompanyStockData[]>(
    "stable/company-screener?" +
      toQueryString({
        isActivelyTrading: true,
        volumeMoreThan: MIN_VOLUME,
        isEtf: false,
        isFund: false,
        country: "US",
        limit: 10000,
      })
  );
  // console.log("Stock Screener:", companies, companies.length);
}

void main();
