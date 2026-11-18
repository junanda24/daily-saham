# SAHAM! — Juragan Saham

Game simulasi trading saham Bursa Efek Indonesia (IDX). Kamu trader pemula
dengan modal virtual **Rp 10.000.000** dan **30 hari bursa** untuk
melipatgandakan uangmu: baca berita pagi, beli murah, jual mahal, dan
pulang dengan gelar — dari "Korban Gorengan" sampai "Sultan Bursa".

Mainkan lewat artifact "SAHAM! — Juragan Saham" (slug
`saham-juragan-saham`) di aplikasi Muse — buka dari Library/sidebar.

## Kenapa ide ini dipilih

Nggak ada yang nyangka project harian hari ini berupa bursa saham. Semua
orang mikir game itu lompat-lompatan; ini game ekonomi yang bikin pemain
mikir kayak trader beneran — baca berita, timbang risiko, tahan godaan
all-in saham gorengan. Datanya nyata (8 emiten IDX dengan harga awal dari
penutupan bursa 18 November 2026), aturannya sama kayak sekuritas beneran
(1 lot = 100 lembar, fee broker 0,15%/0,25%), dan yang bikin menang bukan
tebak-tebakan melainkan siapa yang baca berita lalu bertindak duluan.
Lanjutan seri "Juragan" (JUKIR!, TAWAR!, WARKOP!, KOSTKU!, TITIP!, TANI!,
OJOL!) — lapangannya baru total.

## Fitur

- **8 saham IDX nyata** — BBCA, BBRI, TLKM, ASII, UNVR, ICBP, AMRT, GOTO,
  dengan harga awal penutupan 18 Nov 2026 (BBCA Rp 5.750, BBRI Rp 3.040,
  TLKM Rp 2.050, ASII Rp 5.500, UNVR Rp 1.550, ICBP Rp 6.925,
  AMRT Rp 1.065, GOTO Rp 27) dan IHSG awal 5.321
- **36 berita pasar** — tiap hari 45% peluang muncul satu berita
  (bank, The Fed, dividen, rumor akuisisi GOTO, Lebaran, 5G, mobil listrik...)
  yang menggerakkan harga saham/sektor/pasar; berita tampil sebelum kamu
  bertransaksi hari itu
- **Beli/jual per lot** — pilihan 1 / 5 / 10 / Max / Semua, fee beli 0,15%
  dan fee jual 0,25% dihitung persis, pesan jelas bila kas/lot tidak cukup
- **Dividen tunai** — event dividen BBCA (Rp 25.000/lot) dan UNVR
  (Rp 10.000/lot) membayar ke kasmu
- **Grafik portofolio** (canvas) — nilai total asetmu per hari dengan garis
  acuan modal awal Rp 10.000.000
- **Ticker tape berjalan** — harga + % 8 saham di atas layar
- **Riwayat transaksi** — BELI/JUAL/DIVIDEN lengkap dengan hari, lot,
  harga, dan fee
- **5 gelar akhir** — ≥+50% "Sultan Bursa", ≥+25% "Juragan Saham",
  ≥0% "Trader Bertahan", ≥−25% "Nyangkut di Pucuk", <−25%
  "Korban Gorengan" — plus satu tips berdasarkan perilaku bermainmu
  (fee kebanyakan? all-in satu saham? takut GOTO?)
- **High score & autosave** — rekor return terbaik tersimpan; permainan
  tersimpan otomatis dan bisa dilanjutkan kapan saja ("Lanjutkan Hari N")
- **Suara WebAudio + confetti** — klik, beli, jual, lonceng tutup pasar
  (bisa dimatikan); confetti saat return akhir ≥ +25%
- **Simulasi yang jujur** — pergerakan harga = random walk (Box-Muller)
  dengan drift +0,08%/hari + volatilitas per saham (GOTO 7%/hari, BBCA
  1,2%/hari) + efek berita; harga tak pernah ≤ 0

## Cara main

1. Buka game, tekan **Mulai Main**.
2. Tiap pagi baca **Kabar Bursa** — berita itulah petunjukmu.
3. Ketuk kartu saham, pilih jumlah lot, tekan **BELI** atau **JUAL**.
4. Tekan **TUTUP PASAR** untuk memajukan hari dan melihat harga bergerak.
5. Ulangi sampai hari ke-30. Target: aset akhir ≥ Rp 12.500.000 (+25%)
   untuk gelar "Juragan Saham", ≥ Rp 15.000.000 (+50%) untuk
   "Sultan Bursa".

Kalah pun lucu: rugi = gelar "Korban Gorengan" + tombol **Balas Dendam**
(main lagi dengan strategi beda).

## Cara menjalankan dari source

Game ini satu file HTML statis (`src/index.html`, tanpa build step,
tanpa dependensi kecuali Google Fonts dengan fallback sistem):

```bash
# cara 1: buka langsung
open src/index.html        # atau double-click di file manager

# cara 2: server lokal
python3 -m http.server -d src 8000
# lalu buka http://localhost:8000
```

Progres tersimpan di localStorage browser (key `saham-v1`).

## Tech stack

- HTML + CSS + JavaScript vanilla (satu file, tanpa framework, tanpa
  library chart — grafik digambar manual di `<canvas>`)
- WebAudio API untuk efek suara (tanpa file audio)
- localStorage untuk autosave + high score
- Font: IBM Plex Sans (teks) + IBM Plex Mono (angka) via Google Fonts

## Struktur folder

```
2026-11-19-saham/
├── README.md
├── src/
│   └── index.html            # game lengkap (hasil export artifact)
├── balance/
│   ├── simulate_saham.mjs    # simulasi Monte Carlo 1000 sesi/strategi
│   └── BALANCE_saham_2026-11-19.md   # laporan balance + tuning R0–R3
└── openspec/
    └── changes/
        ├── 2026-11-19-saham/         # proposal, spec, design, tasks
        └── archive/2026-11-19-saham/ # arsip change yang sama
```

## Simulasi balance (bukti angka, bukan perasaan)

Sebelum build, ekonomi game disimulasikan 1000 sesi per strategi
(`balance/simulate_saham.mjs`, `node balance/simulate_saham.mjs`):

| Strategi | Median akhir | P(≥ +25%) | P(rugi) |
|----------|-------------|-----------|---------|
| Buy-and-hold (bagi rata 8 saham) | +2,3% | 1,9% | 40,4% |
| Event follower (beli saat berita positif) | +20,5% | 33,8% | 0,1% |
| All-in GOTO | −3,7% | 24,5% | 53,1% |
| Random trader (asal beli/jual) | +1,4% | 0,9% | 43,7% |

Kesimpulan: pemain yang membaca berita dan bertindak bisa menang;
yang asal-asalan kalah dibanding buy-and-hold; all-in GOTO adalah
judi murni (spread −43% s.d. +59%). Target awal "random trader harus
negatif" direvisi jujur di laporan: ekspektasi pasar positif secara
struktural sehingga trader asal tetap +1,4% — tapi tetap kalah
dibanding buy-and-hold (+2,3%) dan event-follower (+20,5%).

## Verifikasi

- **Playthrough jsdom independen (26/26 lolos):** menu → cara main →
  mulai → beli 5 lot BBCA (total Rp 2.879.313 = 2.875.000 + fee Rp 4.313,
  persis) → jual 1 lot → tutup pasar 30× tanpa softlock → layar hasil →
  Main Lagi → Lanjutkan (Hari 2) memulihkan save. Harga minimum yang
  teramati Rp 25 (lantai Rp 0,5 terjaga). Tanpa window error.
- **Audit builder (real browser):** 0 console error, 0 overflow horizontal
  di 390px; alur penuh dimainkan (beli/jual BBCA, 30 hari, gelar
  "Nyangkut di Pucuk" pada return −0,02%, lencana "Rekor Baru!").
- Yang tidak ter-drive langsung: chip lot 5/10/Max/Semua (handler delegasi
  yang sama terbukti lewat BELI/JUAL), tombol bisu (label berubah
  terverifikasi di jsdom), confetti (hanya muncul pada return ≥ +25%).

## Link hasil

- Game (artifact): "SAHAM! — Juragan Saham" (`saham-juragan-saham`)
  di aplikasi Muse (belum di-share publik; buka dari Library)
- Repo: https://github.com/junanda24/daily-saham
- Rilis: 2026-11-19

## Catatan / temuan saat build

- Harga awal memakai data penutupan publik 18 Nov 2026 (Nerfstock,
  Trenasia, Andre Finance). Semua pergerakan setelahnya adalah simulasi —
  game ini BUKAN aplikasi investasi dan tidak memakai data live
  (butuh lisensi data pasar berbayar).
- GOTO di Rp 27 menjadikannya "saham gorengan" yang sesungguhnya:
  murah banget per lot (Rp 2.700) tapi volatilitas 7%/hari — persis
  seperti aslinya di papan.
- Sengaja TIDAK dibuat: mode tanpa batas hari (30 hari adalah inti
  tantangannya), short selling / margin (menjaga game ramah pemula),
  data harga live.
- Semua aset visual original (kode/CSS/canvas). Nama emiten + kode saham
  adalah fakta publik (ticker BEI).
