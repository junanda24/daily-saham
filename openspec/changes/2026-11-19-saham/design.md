# Design — SAHAM! Juragan Saham

## Stack

- **Web artifact static** (single-file HTML + CSS + JS, client-side only).
  Tanpa build step, tanpa dependensi eksternal kecuali Google Fonts
  (IBM Plex Sans + IBM Plex Mono; fallback sistem bila offline).
- **State:** satu objek `state` (ARCHITECTURE.md §1: pola state → render →
  events). localStorage hanya lewat modul `store` (satu tempat baca/tulis).
- **Grafik:** `<canvas>` 2D digambar manual (garis + area + garis acuan),
  tanpa library chart.
- **Suara:** WebAudio API (oscillator sederhana), tanpa file audio.
- **Confetti:** partikel DOM/canvas buatan sendiri.

## Struktur file (di dalam artifact)

```
index.html      # struktur + mounting point
styles.css      # design token (:root) → komponen → responsive
app.js          # state → data → engine → render → events
```

Tidak ada import antar-fitur (single-file discipline). File ≤300 baris
dipecah secara logis di dalam app.js per seksi berkomentar
(DATA / ENGINE / STORE / RENDER / EVENTS / INIT). Bila satu file
melewati batas, pecah jadi modul ES (data.js, engine.js, app.js).

## Dunia visual (ui-ux-pro-max + impeccable)

- **Arah:** "terminal bursa tengah malam" — gelap, padat, angka besar,
  hijau/merah sebagai bahasa utama. Hasil `--design-system`:
  pola Trust & Authority, gaya Minimalism & Swiss, navy `#0F172A`,
  aksen emas `#A16207`, tipografi IBM Plex Sans (keuangan, tepercaya).
- **Adaptasi ke dark terminal:** background `#0B1220` (navy hampir hitam),
  kartu `#111C33`, teks `#E8EEF7`, muted `#8A97AD`, border `#1E2E4A`,
  emas `#E8B33C` untuk aksen/CTA, hijau naik `#22C55E`, merah turun
  `#EF4444`. Angka pakai IBM Plex Mono.
- **Signature elements:**
  1. Ticker tape berjalan di atas (marquee CSS) — kode + harga + %.
  2. Kartu "Total Aset" raksasa dengan return % besar + panah arah.
  3. Kartu berita bergaya headline koran ("KABAR BURSA") dengan stempel
     dampak (mis. "BBCA +", "SEMUA SAHAM −").
  4. Grafik portofolio dengan garis emas + area hijau/merah.
  5. Tombol "TUTUP PASAR" besar warna emas — satu-satunya CTA primer.
- **Motion:** stagger masuk kartu (GSAP preset Stagger List, 300–450ms,
  back.out(1.4)) — diimplementasikan dengan CSS transition + class,
  tanpa dependensi GSAP (artifact static). Angka berubah dengan flash
  hijau/merah singkat. `prefers-reduced-motion` dihormati (matikan marquee
  + animasi).
- **Mode impeccable:** Operate (visitor menyelesaikan tugas: trading).
  Scanability > ekspresi; brand hidup di detail presisi (angka mono,
  stempel berita, ticker).

## Keranjang state (ARCHITECTURE.md §2)

1. **Lokal (di `state`):** screen (menu/playing/result/how-to), saham
   terpilih, jumlah lot di form beli/jual, mute.
2. **URL:** tidak dipakai (game session, bukan shareable).
3. **Server state:** tidak ada (tanpa backend).
4. **Global client UI:** modal konfirmasi beli/jual (state lokal komponen),
   toast pesan.
5. **Form:** form beli/jual sederhana (bukan React Hook Form — vanilla,
   validasi inline di handler).

## Model ekonomi (engine)

- **Harga awal:** tabel di spec (data penutupan 18 Nov 2026).
- **Pergerakan harian per saham:** `harga *= exp(drift + sigma * Z)`,
  Z ~ N(0,1) via Box-Muller; `drift` +0,08%/hari; sigma per saham dari
  hasil simulasi balance (game-balance-designer) — baseline:
  BBCA 1,2% · BBRI 1,8% · TLKM 2,2% · ASII 2,0% · UNVR 1,5% ·
  ICBP 1,6% · AMRT 2,5% · GOTO 7,0%.
- **Event berita:** tiap hari peluang 45% satu event dari bank event
  (~30 event, masing-masing: target saham/sektor/pasar, efek %,
  headline, dan opsional dividen). Efek diterapkan pada pergerakan hari
  itu. Event pasar memengaruhi semua saham. Event saham: 55% positif,
  besar 5–15%. Event pasar: 50% positif, besar 2–5%.

> **Hasil simulasi balance (1000 sesi/strategi, `balance/`):** buy-and-hold
> median +2,3% · event-follower median +20,5% (33,8% mencapai +25%) ·
> all-in GOTO spread 102 poin (−43% s.d. +59%) · random trader median
> +1,4% — target "random trader < 0%" DITOLAK sebagai tidak realistis
> (ekspektasi pasar positif secara struktural; ranking sudah benar:
> random < buy-and-hold < event-follower). Target GDD direvisi: trader
> asal kalah DIBANDINGKAN buy-and-hold dan event-follower, bukan harus
> negatif absolut. Fee 0,15%/0,25%, lot 100, lantai harga Rp 0,5.
- **IHSG:** bergerak mengikuti rata-rata tertimbang perubahan saham
  (± noise kecil).
- **Fee:** beli 0,15%, jual 0,25%. Lot 100 lembar. Harga dibulatkan ke
  rupiah terdekat (min Rp 1; GOTO bisa turun ke belasan rupiah — tetap
  ≥ Rp 1).
- **Seed:** `Math.random` + seed per permainan disimpan di save
  (replay beda tiap permainan; bukan RNG yang bisa ditebak pemain).
- **Dividen:** event dividen membayar tunai per lot (mis. BBCA Rp 25.000
  per lot = Rp 250/lembar) ke kas saat tutup pasar hari event.

## Bank event (contoh isi; ±28 event di data)

- Bank: "BI tahan suku bunga acuan" (bank +2–4%), "Rupiah melemah,
  asing net sell" (semua −2–4%), "The Fed pangkas suku bunga"
  (semua +2–3%).
- Saham: "BBCA bagi dividen" (BBCA +3–5% + dividen), "GOTO dirumorkan
  diakuisisi raksasa teknologi" (GOTO +10–20%), "Rumor GOTO dibantah"
  (GOTO −8–15%), "Penjualan mobil Astra naik 12%" (ASII +4–7%),
  "Lebaran: penjualan ritel melonjak" (AMRT +4–7%, ICBP +2–4%),
  "Telkom luncurkan 5G di 10 kota" (TLKM +3–6%), "Unilever luncurkan
  produk baru" (UNVR +2–4%), "BBRI salurkan KUR triliunan rupiah"
  (BBRI +2–4%), "Harga minyak goreng naik" (ICBP −2–4% — biaya naik),
  "Mudik: penumpang Telkom naik" (TLKM +2–3%), dst.
- Setiap event: `{ id, headline, target, effectMin, effectMax, dividend? }`.
  Teks headline ditulis natural, gaya koran bisnis Indonesia.

## Alur layar

```
MENU → (Mulai Main) → PLAYING (hari 1..30) → RESULT
MENU → (Cara Main) → HOW-TO → MENU
PLAYING: [ticker] [aset+return] [berita hari ini] [grafik]
         [daftar saham → tap → panel beli/jual] [riwayat]
         [TUTUP PASAR]
RESULT: [total aset] [return] [gelar] [tips] [rekor?] [Main Lagi]
```

## Rencana animasi/interaksi

- Masuk layar: stagger kartu 60ms antar kartu.
- Perubahan harga: flash hijau/merah 400ms pada angka yang berubah.
- Beli/jual sukses: toast + bunyi "cling" + kartu saham berdenyut sekali.
- Tutup pasar: lonceng (dua nada), kartu harga "bergoyang" (shake 150ms),
  ticker diperbarui.
- Hasil menang ≥+25%: confetti 2 detik + gelar muncul dengan scale-in.
- Semua animasi dimatikan bila `prefers-reduced-motion`.

## Verifikasi (rencana)

- Simulasi balance 1000 sesi (game-balance-designer) — target di
  `balance/BALANCE_saham_2026-11-19.md`.
- Uji engine di Node: impor fungsi murni (harga, fee, event) — 30 hari
  jalan tanpa error, harga tidak pernah ≤0, fee konsisten.
- Uji alur di jsdom: menu → mulai → beli → tutup pasar ×30 → hasil →
  main lagi; cek tidak ada softlock (kas 0 + holding kosong tetap bisa
  tutup pasar).
- Cek tiap SHALL R1–R18 terhadap hasil build (trace di verify).
