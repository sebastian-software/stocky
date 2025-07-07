const officialWallstreetSectors = [
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

/** Recommended value from Anne Schwedt */
const fundamentalAnalysis = {
  // How many shares are traded on the stock market?
  // Very important to find out stocks which are actively traded.
  Volume: (value: number) => value > 250000,

  // How much money does the company make in percentage?
  // Very important to find out stocks which are profitable.
  ReturnOnEquity: (value: number) => value > 10,

  // How much debt does the company have?
  // Important to find out stocks which are not in debt.
  DebtToEquity: (value: number) => value < 2,

  // How much money does the company make in percentage?
  // Important to find out stocks which are profitable.
  PriceToEarnings: (value: number) => value < 20,
};

async function main() {
  console.log("Sectors: ", officialWallstreetSectors);
  console.log("Fundamental Analysis: ", fundamentalAnalysis);
}

void main();
