import { chromium, type Page } from "playwright";
import { fundamentalAnalysis, officialWallstreetSectors } from "./config";

async function main() {
  console.log("Sectors: ", officialWallstreetSectors);
  console.log("Fundamental Analysis: ", fundamentalAnalysis);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await getStocks(page);

  await page.waitForTimeout(30000);
  await browser.close();
}

async function getStocks(page: Page) {
  await page.goto("https://www.tradingview.com/screener/");
  await page.keyboard.press("Shift+KeyF");
  await page.keyboard.type("Volume");

  await page.getByRole("group").getByText("Volume", { exact: true }).click();
}

void main();
