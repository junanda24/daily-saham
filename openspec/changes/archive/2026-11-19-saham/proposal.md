# Proposal — SAHAM! Juragan Saham (2026-11-19)

## Apa ini

Game simulasi trading saham Bursa Efek Indonesia (IDX) yang bisa dimainkan
sampai selesai dalam 10–15 menit. Pemain mendapat modal virtual
Rp 10.000.000 dan 30 hari bursa untuk melipatgandakan uangnya dengan jual-beli
8 saham nyata (BBCA, BBRI, TLKM, ASII, UNVR, ICBP, AMRT, GOTO) — lengkap
dengan berita pasar harian yang menggerakkan harga, fee broker, dividen,
grafik portofolio, dan gelar akhir dari "Korban Gorengan" sampai
"Sultan Bursa".

## Kenapa ide ini mengejutkan

- **Nggak ada yang nyangka daily project hari ini berupa bursa saham.**
  Semua orang mikir game = lompat-lompatan; ini game ekonomi yang bikin
  pemain mikir kayak trader beneran: baca berita, timbang risiko, tahan
  godaan all-in GOTO.
- **Data nyata, bukan asal-asalan.** 8 emiten IDX dengan harga awal dari
  penutupan bursa 18 November 2026 (BBCA Rp 5.750, BBRI Rp 3.040,
  ASII Rp 5.500, ICBP Rp 6.925, AMRT Rp 1.065, UNVR Rp 1.550,
  TLKM Rp 2.050, GOTO Rp 27), aturan lot 100 lembar, fee broker
  0,15%/0,25% — aturan mainnya sama kayak sekuritas beneran.
- **Berita adalah senjatanya.** Tiap pagi ada headline — "BI tahan suku
  bunga", "GOTO dirumorkan diakuisisi", "Lebaran, penjualan ritel melonjak"
  — dan pemain yang baca berita lalu bertindak duluan yang menang.
  Ini bukan tebak-tebakan; ini game baca situasi.
- **Lanjutin seri "Juragan".** Setelah JUKIR!, TAWAR!, WARKOP!, KOSTKU!,
  TITIP!, TANI!, OJOL! — sekarang giliran jadi juragan bursa.
  Familier buat Junan, tapi lapangannya baru total.
- **Kalah pun lucu.** Rugi bukan game over yang menyebalkan: gelar
  "Korban Gorengan" + tips + tombol "Balas Dendam" (main lagi).
  Lose-loop-nya bikin ketagihan, bukan kapok.

## Kenapa bentuk output ini: game web artifact (static, client-side)

- Satu sesi 10–15 menit, mobile-first, langsung dimainkan dari browser HP —
  artifact static adalah kendaraan paling pas.
- Tidak butuh backend: harga disimulasikan dari model random walk + event
  (bukan data live — ini game, bukan aplikasi sekuritas; data live butuh
  API berbayar dan lisensi data pasar).
- State bertahan di localStorage: permainan tersimpan otomatis (lanjutkan
  kapan saja), high score + gelar terbaik tersimpan.

## Kenapa TIDAK pakai backend

Logika inti (pergerakan harga, event, fee, dividen) sepenuhnya deterministik
dari seed + model di client. Tidak ada data antar-pemain, tidak ada login,
tidak ada yang perlu disimpan di server. Backend hanya menambah biaya dan
titik gagal tanpa menambah keseruan.

## Uji bar TERCENGANG (2026-11-03)

- Selevel kata-angka / Berani Resign? **Tidak.** Ini produk game lengkap:
  8 aset × 30 hari × ~28 event berita × sistem fee/dividen/gelar/high-score
  + grafik portofolio + autosave. Ada state yang bertahan, alur end-to-end
  (menu → 30 hari → hasil → replay), dan keputusan yang konsekuensinya
  terasa.
- Kalau Junan lihat jam 5 pagi: "anjir, bisa trading saham?!" — senyum
  kaget, bukan "oh".

## Scope

IN: menu awal + cara main, papan pasar 8 saham, beli/jual per lot,
berita harian, tombol "Tutup Pasar" (lanjut hari), grafik nilai portofolio,
riwayat transaksi, gelar akhir + high score, autosave, suara sederhana
(WebAudio, bisa dimatikan), confetti saat menang besar.
OUT: data harga live/real-time, multiplayer, leaderboard online, analisis
teknikal (candlestick dst), rekomendasi saham beneran. Bukan aplikasi
investasi — ada disclaimer jelas di dalam game.

## IP check

- Semua aset visual original (dibuat dengan kode/CSS/canvas). Tidak ada
  logo perusahaan, tidak ada sprite berlisensi.
- Nama emiten + kode saham adalah fakta publik (kode ticker BEI).
  Harga awal memakai data penutupan publik 18 Nov 2026; harga selanjutnya
  simulasi dan diberi label jelas "SIMULASI — bukan harga sebenarnya".
- Disclaimer di layar menu + hasil: "Game edukasi/hiburan. Bukan ajakan
  membeli atau menjual saham."

## Anti-AI-slop

Copy Bahasa Indonesia natural, gaya obrolan trader warung kopi ("Gorengan
lagi panas nih", "Bandar lagi bagi-bagi dividen"), tanpa emoji di label UI,
tanpa kalimat generik "selamat datang di aplikasi...".

## Keputusan yang disengaja TIDAK dibuat

- Tanpa mode "tanpa batas hari" (sandbox): 30 hari adalah inti tantangannya;
  tanpa deadline, tidak ada tensi.
- Tanpa short selling / margin: menjaga game tetap ramah pemula dan
  simulasinya tetap jujur.
