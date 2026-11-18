// ============================================================================
// SAHAM! — Juragan Saham — Balance Simulation
// Monte Carlo: 30 hari bursa, 1000 simulasi per strategi, modal awal Rp 10 jt.
// Jalankan: node simulate_saham.mjs
// ============================================================================

// ---------------- PARAMS (tuning knob — ubah di sini, catat di BALANCE log) --
const PARAMS = {
  days: 30,
  sims: 1000,
  initialCapital: 10_000_000,
  lotSize: 100,
  feeBuy: 0.0015, // 0.15%
  feeSell: 0.0025, // 0.25%
  drift: 0.0008, // +0.08% / hari untuk semua saham
  eventProb: 0.45, // 0.35 -> 0.45 (R1: lebih banyak event = lebih banyak peluang C)
  eventMarketProb: 0.25, // dari event yang ada, peluang event pasar (vs 1 saham)
  eventStockPosProb: 0.55, // 0.60 -> 0.55 (R2: kurangi skew positif; B ikut terangkat event)
  eventStockMagMin: 0.05, // 0.03 -> 0.05 (R1: event saham 5-15%)
  eventStockMagMax: 0.15, // 0.12 -> 0.15
  eventMarketPosProb: 0.5, // 0.55 -> 0.50 (R2: event pasar netral)
  eventMarketMagMin: 0.02, // 0.015 -> 0.02 (R1: event pasar 2-5%)
  eventMarketMagMax: 0.05, // 0.04 -> 0.05
  followerBuyLots: 10, // 5 -> 8 (R1) -> 10 (R3: margin keamanan C, P(>=+25%) R2 tipis 25,2%)
  followerMarketBuyLots: 2, // strategi C: beli N lot tiap saham saat event pasar +
  randomTradesPerDay: 3, // 1 -> 3 (R3: B trading 3 saham/hari; lihat stratRandom)
  randomMinLots: 3, // 1 -> 2 (R1) -> 3 (R2: B churn lebih besar)
  randomMaxLots: 8, // 3 -> 5 (R1) -> 8 (R2)
};

const STOCKS = [
  { code: "BBCA", price0: 5750, sigma: 0.012 },
  { code: "BBRI", price0: 3040, sigma: 0.018 },
  { code: "TLKM", price0: 2050, sigma: 0.022 },
  { code: "ASII", price0: 5500, sigma: 0.020 },
  { code: "UNVR", price0: 1550, sigma: 0.015 },
  { code: "ICBP", price0: 6925, sigma: 0.016 },
  { code: "AMRT", price0: 1065, sigma: 0.025 },
  { code: "GOTO", price0: 27, sigma: 0.07 },
];

// ---------------- RNG (seedable, reproducible) -------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32(parseInt(process.env.SEED || "20261119", 10));
const BASE_SEED = parseInt(process.env.SEED || "20261119", 10);
const rand = () => rng();
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));
const randUniform = (min, max) => min + rand() * (max - min);
// Box–Muller
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------- Portfolio ---------------------------------------------------
class Portfolio {
  constructor(cash) {
    this.cash = cash;
    this.feesPaid = 0;
    this.hold = Object.fromEntries(STOCKS.map((s) => [s.code, 0])); // lot
  }
  // beli `lots` lot saham i dengan harga `price`; return lot yang benar-benar terbeli
  buy(i, lots, price) {
    const s = STOCKS[i];
    const lotPrice = price * PARAMS.lotSize;
    const costPerLot = lotPrice * (1 + PARAMS.feeBuy);
    const afford = Math.floor(this.cash / costPerLot);
    const n = Math.min(lots, afford);
    if (n <= 0) return 0;
    this.cash -= n * costPerLot;
    this.feesPaid += n * lotPrice * PARAMS.feeBuy;
    this.hold[s.code] += n;
    return n;
  }
  // jual `lots` lot saham i dengan harga `price`; return lot yang benar-benar terjual
  sell(i, lots, price) {
    const s = STOCKS[i];
    const n = Math.min(lots, this.hold[s.code]);
    if (n <= 0) return 0;
    this.cash += n * price * PARAMS.lotSize * (1 - PARAMS.feeSell);
    this.feesPaid += n * price * PARAMS.lotSize * PARAMS.feeSell;
    this.hold[s.code] -= n;
    return n;
  }
  sellAll(prices) {
    STOCKS.forEach((s, i) => this.sell(i, this.hold[s.code], prices[i]));
  }
  value(prices) {
    let v = this.cash;
    STOCKS.forEach((s, i) => (v += this.hold[s.code] * prices[i] * PARAMS.lotSize));
    return v;
  }
}

// ---------------- Satu hari: event + harga ------------------------------------
function drawEvent() {
  if (rand() >= PARAMS.eventProb) return null;
  if (rand() < PARAMS.eventMarketProb) {
    const sign = rand() < PARAMS.eventMarketPosProb ? 1 : -1;
    const mag = randUniform(PARAMS.eventMarketMagMin, PARAMS.eventMarketMagMax);
    return { type: "market", sign, mag };
  }
  const idx = randInt(0, STOCKS.length - 1);
  const sign = rand() < PARAMS.eventStockPosProb ? 1 : -1;
  const mag = randUniform(PARAMS.eventStockMagMin, PARAMS.eventStockMagMax);
  return { type: "stock", idx, sign, mag };
}

// Gerakkan harga 1 hari: random walk + efek event hari itu.
// NOTE: harga event berlaku untuk hari yang sama (pengumuman pagi, gerak sore).
function movePrices(prices, event) {
  return prices.map((p, i) => {
    let r = PARAMS.drift + STOCKS[i].sigma * randn();
    if (event) {
      if (event.type === "market") r += event.sign * event.mag;
      else if (event.idx === i) r += event.sign * event.mag;
    }
    return Math.max(p * (1 + r), 0.5); // lantai Rp 0,5 (GOTO tidak bisa 0)
  });
}

// ---------------- Strategi -----------------------------------------------------
// Setiap strategi: fungsi (day, prices, event, pf) -> void. Day 0 = hari 1 (sebelum gerak).
function stratBuyHold(day, prices, event, pf) {
  if (day !== 0) return;
  const per = PARAMS.initialCapital / STOCKS.length;
  STOCKS.forEach((s, i) => {
    const lots = Math.floor(per / (prices[i] * PARAMS.lotSize));
    pf.buy(i, lots, prices[i]);
  });
}
function stratRandom(day, prices, event, pf) {
  // R3: trader asal trading 3 saham acak per hari (bukan 1) — volume x3,
  // fee menggerogoti + churn bikin sering ketinggalan lompatan event.
  for (let t = 0; t < PARAMS.randomTradesPerDay; t++) {
    const i = randInt(0, STOCKS.length - 1);
    const lots = randInt(PARAMS.randomMinLots, PARAMS.randomMaxLots);
    if (rand() < 0.5) pf.buy(i, lots, prices[i]);
    else pf.sell(i, lots, prices[i]);
  }
}
function stratEventFollower(day, prices, event, pf) {
  if (!event) return;
  if (event.type === "market") {
    if (event.sign > 0) {
      STOCKS.forEach((s, i) => pf.buy(i, PARAMS.followerMarketBuyLots, prices[i]));
    } else {
      pf.sellAll(prices);
    }
    return;
  }
  if (event.sign > 0) {
    pf.buy(event.idx, PARAMS.followerBuyLots, prices[event.idx]);
  } else {
    pf.sell(event.idx, pf.hold[STOCKS[event.idx].code], prices[event.idx]);
  }
}
function stratAllInGoto(day, prices, event, pf) {
  if (day !== 0) return;
  const gotoIdx = STOCKS.findIndex((s) => s.code === "GOTO");
  const lots = Math.floor(pf.cash / (prices[gotoIdx] * PARAMS.lotSize * (1 + PARAMS.feeBuy)));
  pf.buy(gotoIdx, lots, prices[gotoIdx]);
}

const STRATEGIES = {
  A: { name: "A) Buy-and-Hold (rata 8 saham)", fn: stratBuyHold },
  B: { name: "B) Random Trader", fn: stratRandom },
  C: { name: "C) Event Follower", fn: stratEventFollower },
  D: { name: "D) All-in GOTO", fn: stratAllInGoto },
};

// ---------------- Simulasi -----------------------------------------------------
function runOne(stratFn) {
  let prices = STOCKS.map((s) => s.price0);
  const pf = new Portfolio(PARAMS.initialCapital);
  for (let day = 0; day < PARAMS.days; day++) {
    const event = drawEvent(); // (1) event diumumkan
    stratFn(day, prices, event, pf); // (2) strategi trading
    prices = movePrices(prices, event); // (3) harga bergerak
  }
  pf.sellAll(prices); // likuidasi hari 30 (kena fee jual)
  return { wealth: pf.cash, fees: pf.feesPaid };
}

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function runAll() {
  const out = {};
  for (const [key, strat] of Object.entries(STRATEGIES)) {
    rng = mulberry32(BASE_SEED + key.charCodeAt(0)); // seed beda per strategi, tetap reproducible
    const finals = [];
    const feesArr = [];
    for (let n = 0; n < PARAMS.sims; n++) {
      const r = runOne(strat.fn);
      finals.push(r.wealth);
      feesArr.push(r.fees);
    }
    finals.sort((a, b) => a - b);
    const ret = (w) => ((w - PARAMS.initialCapital) / PARAMS.initialCapital) * 100;
    const pct = (p) => percentile(finals, p);
    out[key] = {
      name: strat.name,
      p10: ret(pct(10)), p25: ret(pct(25)), p50: ret(pct(50)),
      p75: ret(pct(75)), p90: ret(pct(90)),
      pGe25: (finals.filter((w) => w >= 12_500_000).length / finals.length) * 100,
      pBelow0: (finals.filter((w) => w < PARAMS.initialCapital).length / finals.length) * 100,
      mean: ret(finals.reduce((a, b) => a + b, 0) / finals.length),
      meanFeesPct: (feesArr.reduce((a, b) => a + b, 0) / feesArr.length / PARAMS.initialCapital) * 100,
    };
  }
  return out;
}

// ---------------- Output -------------------------------------------------------
const res = runAll();
const fmt = (x) => (x >= 0 ? "+" : "") + x.toFixed(1) + "%";
console.log("PARAMS:", JSON.stringify(PARAMS, null, 2));
console.log("\nModal awal Rp 10.000.000 | 30 hari | 1000 sims/strategi | target +25% = Rp 12.500.000\n");
console.log(
  "Strategi".padEnd(34) +
  "P10".padStart(8) + "P25".padStart(8) + "P50".padStart(8) + "P75".padStart(8) + "P90".padStart(8) +
  "  mean".padStart(8) + "  P(≥+25%)".padStart(10) + "  P(<0)".padStart(8) + "  fee".padStart(7)
);
for (const [k, r] of Object.entries(res)) {
  console.log(
    r.name.padEnd(34) +
    fmt(r.p10).padStart(8) + fmt(r.p25).padStart(8) + fmt(r.p50).padStart(8) +
    fmt(r.p75).padStart(8) + fmt(r.p90).padStart(8) +
    fmt(r.mean).padStart(8) +
    r.pGe25.toFixed(1).padStart(9) + "%" +
    r.pBelow0.toFixed(1).padStart(7) + "%" +
    r.meanFeesPct.toFixed(2).padStart(6) + "%"
  );
}
console.log("\nSpread D (P90-P10):", (res.D.p90 - res.D.p10).toFixed(1) + "pp");
console.log(JSON.stringify(res, null, 2));
