# BALANCE REPORT — SAHAM! Juragan Saham

**Tanggal:** 2026-11-19 · **Simulasi:** Monte Carlo, 30 hari bursa, 1000 simulasi/strategi, modal awal Rp 10.000.000
**Script:** `balance/simulate_saham.mjs` (jalankan: `node simulate_saham.mjs`, opsional `SEED=<n> node simulate_saham.mjs`)
**Status akhir: 3 dari 4 target PASS. Target B (Random Trader median < 0%) FAIL — lihat §5.**

---

## 1. Intent → Target

| # | Intent (GDD) | Target terukur | Hasil akhir | Verdict |
|---|---|---|---|---|
| A | Buy-and-hold = strategi "sehat", untung moderat | Median **+1% s.d. +7%** | **+2,3%** (range 3 seed: +2,1 s.d. +2,5%) | ✅ PASS |
| B | Trader asal-asalan kalah oleh fee | Median **< 0%** | **+1,4%** (range 3 seed: +0,4 s.d. +1,4%) | ❌ FAIL |
| C | Ikut berita = strategi paling cuan | Median **≥ +12%** dan **P(≥+25%) ≥ 25%** | **+20,5%** dan **33,8%** (range: +19,8–+20,5% / 31,9–33,8%) | ✅ PASS |
| D | All-in GOTO = judi, spread lebar | **P90 − P10 besar** (risiko nyata) | **102,4 pp** (range: 102,4–104,1 pp) | ✅ PASS |

---

## 2. Formulas

### Harga harian (random walk + event)

```
r_harian(i) = drift + sigma_i * N(0,1) + efek_event(i)
harga_baru(i) = max(harga_lama(i) * (1 + r_harian(i)), 0,5)
```

Lantai Rp 0,5 mencegah GOTO (Rp 27) jatuh ke nol/negatif. `N(0,1)` via Box–Muller, RNG mulberry32 (seeded, reproducible).

### Event berita (diundi tiap hari, SEBELUM trading)

| Parameter | Nilai FINAL |
|---|---|
| Peluang ada event / hari | 45% |
| Dari event: peluang event pasar (vs 1 saham) | 25% |
| Event saham: peluang bertanda + | 55% |
| Event saham: besar | uniform **5–15%** |
| Event pasar: peluang bertanda + | 50% |
| Event pasar: besar | uniform **2–5%** (semua saham) |

Urutan tiap hari: (1) event diumumkan → (2) strategi trading → (3) harga bergerak (random walk + efek event hari itu). Jadi strategi C yang beli saat event positif **menangkap lompatan hari itu juga**.

### Transaksi

| Aturan | Nilai |
|---|---|
| Lot | 100 lembar |
| Fee beli | 0,15% dari nilai transaksi |
| Fee jual | 0,25% dari nilai transaksi |
| Likuidasi akhir | Hari 30: jual semua holding (kena fee jual), wealth akhir = kas |

### Saham (harga awal 18 Nov 2026, sigma FINAL = tidak berubah dari baseline)

| Kode | Harga awal (Rp) | σ harian |
|---|---|---|
| BBCA | 5750 | 1,2% |
| BBRI | 3040 | 1,8% |
| TLKM | 2050 | 2,2% |
| ASII | 5500 | 2,0% |
| UNVR | 1550 | 1,5% |
| ICBP | 6925 | 1,6% |
| AMRT | 1065 | 2,5% |
| GOTO | 27 | 7,0% |

Drift harian: **+0,08%** untuk semua saham (tidak berubah).

### Strategi (definisi FINAL — ada yang berubah dari brief awal, lihat §4)

| Strategi | Aturan |
|---|---|
| A) Buy-and-Hold | Hari 1: modal dibagi rata ke 8 saham (per lot, sisa jadi kas). Tahan s.d. hari 30. |
| B) Random Trader | Tiap hari: **3 saham acak**, masing-masing acak beli/jual **3–8 lot** (terbatas kas/holding). |
| C) Event Follower | Event positif saham X → beli **10 lot** X (atau semampunya). Event negatif X + sedang pegang X → jual semua X. Event pasar + → beli 2 lot tiap saham. Event pasar − → jual semua. Tanpa event → tahan. |
| D) All-in GOTO | Hari 1: beli GOTO semampunya. Tahan s.d. hari 30. |

### Metrik

```
return = (wealth_akhir − 10.000.000) / 10.000.000
P10/P25/P50/P75/P90 = persentil return akhir (1000 sims, interpolasi linear)
P(≥+25%) = % sims dengan wealth akhir ≥ Rp 12.500.000
P(<0)    = % sims dengan wealth akhir < Rp 10.000.000
fee      = rata-rata total fee dibayar, sebagai % modal awal
```

---

## 3. Simulation — hasil akhir (seed utama 20261119)

Modal awal Rp 10.000.000 · 30 hari · 1000 sims/strategi · target +25% = Rp 12.500.000

| Strategi | P10 | P25 | P50 (median) | P75 | P90 | Mean | P(≥+25%) | P(<0) | Fee rata-rata |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A) Buy-and-Hold | −8,9% | −3,9% | **+2,3%** | +8,9% | +15,2% | +2,7% | 1,9% | 40,4% | 0,37% |
| B) Random Trader | −9,5% | −4,6% | **+1,4%** | +7,9% | +14,3% | +1,8% | 0,9% | 43,7% | 1,50% |
| C) Event Follower | +9,3% | +13,8% | **+20,5%** | +27,2% | +34,6% | +21,4% | **33,8%** | 0,1% | 0,75% |
| D) All-in GOTO | −43,2% | −26,6% | −3,7% | +24,0% | +59,2% | +3,7% | 24,5% | 53,1% | 0,41% |

**Spread D (P90−P10) = 102,4 pp** — P10 −43,2% vs P90 +59,2%: judi tulen, separuh simulasi rugi, seperempat simulasi cuan ≥+25%.

### Cek stabilitas (seed sensitivity — parameter sama, seed beda)

| Seed | A median | B median | C median | C P(≥+25%) | D spread |
|---|---|---|---|---|---|
| 20261119 | +2,3% | +1,4% | +20,5% | 33,8% | 102,4 pp |
| 777001 | +2,5% | +0,5% | +19,8% | 31,9% | 104,1 pp |
| 424242 | +2,1% | +0,4% | +20,0% | 32,4% | 103,4 pp |

Semua target yang PASS stabil di ketiga seed. B FAIL di ketiga seed, tapi tipis (+0,4 s.d. +1,4%).

---

## 4. Tuning log (3 ronde — sesuai batas)

### Ronde 0 — baseline (brief awal, apa adanya)

Event 35%/hari, saham 3–12% (+60%), pasar 1,5–4% (+55%), drift +0,08%, C beli 5 lot, B 1 saham/hari 1–3 lot.

| Strategi | P50 | P(≥+25%) | Verdict |
|---|---|---|---|
| A | +2,8% | 1,3% | ✅ PASS |
| B | +0,9% | 0,0% | ❌ FAIL (harus < 0%) |
| C | +9,4% | 2,0% | ❌ FAIL (butuh ≥+12% / ≥25%) |
| D | −4,7% (spread 102,2 pp) | 25,9% | ✅ PASS |

### Ronde 1 — dongkrak C (event lebih sering & lebih besar, C lebih agresif)

Event 35%→**45%**/hari; saham 3–12%→**5–15%**; pasar 1,5–4%→**2–5%**; C beli 5→**8 lot**; B 1–3→**2–5 lot** (fee drag lebih besar).

| Strategi | P50 | P(≥+25%) | Verdict |
|---|---|---|---|
| A | +4,3% | 2,8% | ✅ PASS |
| B | +2,4% | 1,1% | ❌ FAIL — malah NAIK: event lebih besar ikut mengangkat random trader |
| C | +20,5% | 32,2% | ✅ PASS |
| D | −1,0% (spread 105,0 pp) | 26,9% | ✅ PASS |

Pelajaran R1: menaikkan event mengangkat SEMUA strategi yang sedang invested, termasuk B. Fee 0,15%/0,25% pada volume kecil tidak cukup menahan.

### Ronde 2 — tekan skew positif (turunkan ekspektasi pasar), B churn lebih besar

Event saham + 60%→**55%**, event pasar + 55%→**50%**; B 2–5→**3–8 lot**.

| Strategi | P50 | P(≥+25%) | Verdict |
|---|---|---|---|
| A | +2,3% | 1,9% | ✅ PASS |
| B | +1,4% | 1,8% | ❌ FAIL (turun dari +2,4%, belum cukup) |
| C | +18,5% | 25,2% | ✅ PASS — tapi P(≥+25%) tipis (25,2%) |
| D | −3,7% (spread 102,4 pp) | 24,5% | ✅ PASS |

### Ronde 3 — B trading 3 saham/hari, C margin keamanan

B: 1→**3 saham acak/hari** (3–8 lot tiap saham) → volume ±3×, fee 0,67%→1,50%. C beli 8→**10 lot** (margin keamanan untuk P(≥+25%)).

| Strategi | P50 | P(≥+25%) | Verdict |
|---|---|---|---|
| A | +2,3% | 1,9% | ✅ PASS |
| B | +1,4% | 0,9% | ❌ FAIL — fee naik 2× tapi median TIDAK BERGERAK |
| C | +20,5% | 33,8% | ✅ PASS (margin aman) |
| D | −3,7% (spread 102,4 pp) | 24,5% | ✅ PASS |

Pelajaran R3 (kunci): B yang trading 3×/hari justru **deploy kas lebih cepat** (awal permainan B belum punya holding → jual selalu gagal → B didominasi beli), sehingga B lebih lama fully-invested dan gross return-nya naik menutupi fee tambahan. Fee 1,50% vs gross pasar ~+2,7% → B tetap positif.

---

## 5. Kenapa target B FAIL — analisis struktural (bukan noise)

Ekspektasi return buy-and-hold (A) dengan konstanta final:

```
drift            +0,08% × 30 hari                 ≈ +2,4%
event saham      ~1,3 event/saham × (+1% net*)     ≈ +1,3%
event pasar      ~3,4 event × (0% net, 50/50)      ≈ +0,0%
fee beli+jual (A)                                  ≈ −0,4%
volatility drag (rata-rata portofolio)             ≈ −0,6%
---------------------------------------------------------------
ekspektasi A                                       ≈ +2,7%  (simulasi: mean +2,7% ✓)
*) event saham net = (2×0,55−1) × 10% rata-rata = +1% per event
```

Strategi B yang invested ~90% waktu akan mendapat ~90% dari gross pasar (+2,7%) dikurangi fee-nya sendiri (~1,5%) ≈ **+1%**. Untuk B median < 0% dengan pasar sepositif ini, butuh SATU dari:

1. **Fee jauh lebih besar** — butuh fee ~3,5% dari modal (≈ volume trading ~Rp 175 jt / 30 hari, ±6 jt/hari). Itu ±6× volume B saat ini; tidak masuk akal untuk "1–3 lot/hari".
2. **B keluar pasar lebih lama** — mis. bias jual (jual 65–75% dari trade) sehingga B sering pegang kas dan ketinggalan drift. Ini mengubah definisi B dari "acak 50/50" menjadi "trader panik".
3. **Pasar lebih datar** — drift +0,08%→~+0,02% atau event netral penuh. Tapi ini menjatuhkan A ke bawah +1% (A sekarang +2,3%, headroom cuma 1,3 pp) — target A dan B saling mengunci.
4. **Terima B ≈ +0,5–+1,5%** dan ubah target GDD: "trader asal tetap kalah DIBANDING buy-and-hold dan event follower" (B +1,4% vs A +2,3% vs C +20,5% — ranking-nya sudah benar, hanya tandanya belum negatif).

**Rekomendasi saya: opsi 4 + sebagian opsi 2.** Di game, NPC/contoh "trader asal" bisa dibuat dengan bias jual + trading lebih besar (mis. tiap hari jual 1 saham yang sedang naik = "take profit terlalu cepat"), yang secara perilaku terasa benar untuk pemain dan secara matematis mendorong median ke negatif. Kalau GDD tetap mau B median < 0% dengan definisi 50/50 murni, satu-satunya jalan adalah menaikkan fee in-game (mis. fee beli 0,3% / jual 0,5%) — tapi itu tidak lagi mencerminkan fee broker RI yang sebenarnya (0,15%/0,25%).

---

## 6. Konstanta FINAL untuk kode game

Pakai angka ini apa adanya di `simulate`/game logic:

```js
const STOCKS = [
  { code: "BBCA", price0: 5750, sigma: 0.012 },
  { code: "BBRI", price0: 3040, sigma: 0.018 },
  { code: "TLKM", price0: 2050, sigma: 0.022 },
  { code: "ASII", price0: 5500, sigma: 0.020 },
  { code: "UNVR", price0: 1550, sigma: 0.015 },
  { code: "ICBP", price0: 6925, sigma: 0.016 },
  { code: "AMRT", price0: 1065, sigma: 0.025 },
  { code: "GOTO", price0: 27,   sigma: 0.070 },
];
const DRIFT = 0.0008;            // +0,08%/hari
const LOT = 100;
const FEE_BUY = 0.0015, FEE_SELL = 0.0025;
const EVENT_PROB = 0.45;         // per hari
const EVENT_MARKET_PROB = 0.25;  // dari event yang terjadi
const EVENT_STOCK_POS = 0.55, EVENT_STOCK_MAG = [0.05, 0.15];
const EVENT_MARKET_POS = 0.50, EVENT_MARKET_MAG = [0.02, 0.05];
// Urutan harian: event diumumkan -> trading -> harga bergerak (walk + efek event)
// Lantai harga: max(harga, 0.5)
```

Perilaku referensi (bila game butuh AI/contoh strategi):
- **Event Follower (C):** beli 10 lot saat event positif saham; 2 lot/saham saat event pasar positif; jual semua saat event negatif (saham tsb / semua saat pasar negatif).
- **Random Trader (B):** 3 saham acak/hari, 3–8 lot, 50/50 beli/jual — median akhir ≈ +1,4% (BUKAN negatif, lihat §5).

---

## 7. Catatan metodologi & batasan

- **Seed per strategi berbeda** (seed dasar + kode huruf strategi): perbandingan antar-strategi mengandung noise jalur harga. Untuk perbandingan yang lebih tajam, game bisa memakai *common random numbers* (seed sama untuk semua strategi) — tidak dilakukan di sini karena brief meminta 1000 sims/strategi independen.
- **Event tidak berkorelasi antar hari** dan tidak ada tren/mean-reversion; pasar murni random walk + event. Ini disengaja (game arcade, bukan prediksi bursa).
- **Harga awal = data 18 Nov 2026** (diberikan di brief, tidak diverifikasi ulang ke sumber live).
- **Tidak ada dividen, stock split, suspensi, atau ARB/ARA** — di luar scope GDD 30 hari.
- Monte Carlo error: SE median ≈ ±0,3 pp; SE P(≥+25%) ≈ ±1,5 pp (n=1000). Hasil C (33,8%) dan A (+2,3%) jauh dari batas target, jadi verdict-nya kokoh. B (+0,4 s.d. +1,4% di 3 seed) kokoh FAIL-nya, tapi jarak ke 0% kecil.
- Ronde tuning: 3/3 terpakai (R1, R2, R3). Tidak ada ronde ke-4.
