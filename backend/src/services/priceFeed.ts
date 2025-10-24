// src/services/priceFeed.ts
import axios from "axios";
import https from "https";
import { prisma } from "../db";

const AGENT = new https.Agent({
  rejectUnauthorized: process.env.ALLOW_INSECURE_TLS !== "true",
});

function parseSymbols(): string[] {
  const raw = process.env.FEED_SYMBOLS || "TONUSDT";
  return raw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
}

async function writeTick(symbol: string, price: number) {
  // console.log("[price-feed] tick", symbol, price);
  await prisma.oracleTick.create({
    data: { symbol, price, volatility: 25, confidence: 99, timestamp: new Date() },
  });
}

/** Provider: CoinGecko (USD) */
async function fetchCoingecko(symbols: string[]): Promise<Map<string, number>> {
  // mapping exchange → coingecko ids
  const idMap: Record<string, string> = {
    BTCUSDT: "bitcoin",
    ETHUSDT: "ethereum",
    TONUSDT: "toncoin",
  };
  const ids = symbols.map(s => idMap[s]).filter(Boolean);
  if (!ids.length) return new Map();

  const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
    params: { ids: ids.join(","), vs_currencies: "usd" },
    timeout: 5000,
    httpsAgent: AGENT,
  });

  const out = new Map<string, number>();
  for (const [ex, id] of Object.entries(idMap)) {
    if (symbols.includes(ex) && data?.[id]?.usd) out.set(ex, Number(data[id].usd));
  }
  return out;
}

/** Provider: OKX */
async function fetchOkx(symbols: string[]): Promise<Map<string, number>> {
  const map: Record<string, string> = {
    BTCUSDT: "BTC-USDT",
    ETHUSDT: "ETH-USDT",
    TONUSDT: "TON-USDT",
  };
  const out = new Map<string, number>();
  await Promise.all(
    symbols.map(async s => {
      const instId = map[s];
      if (!instId) return;
      const { data } = await axios.get("https://www.okx.com/api/v5/market/ticker", {
        params: { instId },
        timeout: 5000,
        httpsAgent: AGENT,
      });
      const last = Number(data?.data?.[0]?.last);
      if (!Number.isFinite(last)) return;
      out.set(s, last);
    })
  );
  return out;
}

/** Provider: Binance public mirror */
async function fetchBinanceMirror(symbols: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  await Promise.all(
    symbols.map(async s => {
      const { data } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price", {
        params: { symbol: s },
        timeout: 5000,
        httpsAgent: AGENT,
      });
      const p = Number(data?.price);
      if (!Number.isFinite(p)) return;
      out.set(s, p);
    })
  );
  return out;
}

async function fetchWithFallback(symbols: string[]): Promise<Map<string, number>> {
  // urutan: coingecko -> okx -> binance mirror
  let res = await fetchCoingecko(symbols).catch(() => new Map<string, number>());
  const miss1 = symbols.filter(s => !res.has(s));
  if (miss1.length) {
    const r2 = await fetchOkx(miss1).catch(() => new Map<string, number>());
    for (const [k, v] of r2) res.set(k, v);
  }
  const miss2 = symbols.filter(s => !res.has(s));
  if (miss2.length) {
    const r3 = await fetchBinanceMirror(miss2).catch(() => new Map<string, number>());
    for (const [k, v] of r3) res.set(k, v);
  }
  return res;
}

/** Mulai polling REST multi-symbol */
function startRestMulti(intervalMs = 2000) {
  const symbols = parseSymbols();
  console.log("[price-feed] REST multi symbols:", symbols.join(","));
  const tick = async () => {
    try {
      const prices = await fetchWithFallback(symbols);
      for (const s of symbols) {
        const px = prices.get(s);
        if (typeof px === "number") await writeTick(s, px);
      }
    } catch (e: any) {
      console.log("[price-feed] polling error:", e?.message || e);
    }
  };
  // jalankan segera, lalu interval
  tick();
  setInterval(tick, intervalMs);
}

/** API yang dipanggil dari index.ts */
export function startGlobalPriceFeed() {
  const mode = (process.env.PRICE_FEED || "rest_multi").toLowerCase();
  if (mode === "rest_multi") {
    startRestMulti(2000);
  } else {
    // fallback default tetap rest
    startRestMulti(2000);
  }
}
