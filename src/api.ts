import PQueue from "p-queue";

const POLYGON_BASE_URL = "https://api.polygon.io/v3/";
const FMP_BASE_URL = "https://financialmodelingprep.com/";

const queue = new PQueue({
  concurrency: 1, // Only 1 fetch at a time
  interval: 60_000, // 1 minute
  intervalCap: 60, // Max 60 fetches per minute
});

export function toQueryString(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

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

export function polygonFetch<DataType = unknown>(
  path: string,
  options?: RequestInit
): Promise<DataType> {
  const optionsWithAuth = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${process.env.POLY_API_KEY}`,
    },
  };

  return queue.add(() =>
    fetchData(POLYGON_BASE_URL + path, optionsWithAuth)
  ) as Promise<DataType>;
}

export function fmpFetch<DataType = unknown>(
  path: string,
  options?: RequestInit
): Promise<DataType> {
  return queue.add(() => {
    const addSymbol = path.includes("?") ? "&" : "?";
    return fetchData(
      FMP_BASE_URL + path + addSymbol + `apikey=${process.env.FMP_API_KEY}`,
      options
    );
  }) as Promise<DataType>;
}

async function main() {
  const data = await fmpFetch("stable/search-symbol?query=AAPL");
  console.log("AAPL Search:", data);

  const data2 = await fmpFetch(
    "stable/company-screener?" +
      toQueryString({
        marketCapMoreThan: "10000000000",
        isActivelyTrading: "true",
        volumeMoreThan: "250000",
        isEtf: "false",
        isFund: "false",
        country: "US",
        limit: "10000",
      })
  );
  console.log("Stock Screener:", data2, data2.length);
}

void main();
