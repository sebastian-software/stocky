export const officialWallstreetSectors = [
  "Communication Services",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Financials",
  "Health Care",
  "Industrials",
  "Information Technology",
  "Materials",
  "Real Estate",
  "Utilities",
] as const;

export const MIN_VOLUME = 250000;
export const MIN_RETURN_ON_EQUITY = 10;
export const MAX_DEBT_TO_EQUITY = 2;
export const MAX_PRICE_TO_EARNINGS = 20;

/** Recommended value from Anne Schwedt */
export const fundamentalAnalysis = {
  // How many shares are traded on the stock market?
  // Very important to find out stocks which are actively traded.
  Volume: (value: number) => value > MIN_VOLUME,

  // How much money does the company make in percentage?
  // Very important to find out stocks which are profitable.
  ReturnOnEquity: (value: number) => value > MIN_RETURN_ON_EQUITY,

  // How much debt does the company have?
  // Important to find out stocks which are not in debt.
  DebtToEquity: (value: number) => value < MAX_DEBT_TO_EQUITY,

  // How much money does the company make in percentage?
  // Important to find out stocks which are profitable.
  PriceToEarnings: (value: number) => value < MAX_PRICE_TO_EARNINGS,
};
