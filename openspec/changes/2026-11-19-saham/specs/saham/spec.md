# Spec — SAHAM! Juragan Saham

## Capability: saham (game simulasi trading IDX)

### GDD ringkas (game-designer)

- **Pitch:** Kamu trader pemula dengan modal Rp 10 juta dan 30 hari bursa.
  Baca berita, beli murah, jual mahal, kalahkan pasar. Kalau beruntung
  (dan pintar), pulang bawa gelar Sultan Bursa.
- **Pilar:** (1) Keputusan berisiko nyata — tiap transaksi ada konsekuensi
  uang beneran (virtual). (2) Berita menggerakkan pasar — yang baca berita
  dan bertindak duluan yang menang. (3) Seri Juragan — humor pasar modal
  Indonesia, bahasa sehari-hari.
- **Core loop 30 detik:** lihat harga + berita pagi → putuskan beli/jual →
  tekan "Tutup Pasar" → lihat harga bergerak + portofolio naik/turun →
  ulang besok.
- **Loop 5 menit:** kejar tren satu saham, kejar event besar, jaga jangan
  sampai portofolio merah berhari-hari.
- **Loop sesi:** 30 hari → gelar akhir → bandingkan high score → main lagi
  dengan strategi beda.
- **Lose-loop:** rugi = gelar lucu ("Korban Gorengan", "Nyangkut di Pucuk")
  + satu tips spesifik dari permainanmu + tombol "Balas Dendam" yang
  langsung mulai permainan baru. Kalah terasa seperti lelucon, bukan
  hukuman — dan bikin penasaran coba strategi lain.
- **Vertical slice:** game penuh adalah slice-nya (satu sesi 10–15 menit).
  Acceptance test: pemain baru menyelesaikan 30 hari tanpa bantuan dalam
  <15 menit dan paham kenapa dia menang/kalah dari layar hasil.

### Data pasar (grounded, penutupan 18 Nov 2026)

| Kode | Emiten | Harga awal (Rp) | Sektor | Volatilitas |
|------|--------|-----------------|--------|-------------|
| BBCA | Bank Central Asia | 5.750 | Bank | rendah |
| BBRI | Bank Rakyat Indonesia | 3.040 | Bank | rendah–sedang |
| TLKM | Telkom Indonesia | 2.050 | Telekomunikasi | sedang |
| ASII | Astra International | 5.500 | Otomotif/Konglomerat | sedang |
| UNVR | Unilever Indonesia | 1.550 | Konsumer defensif | rendah |
| ICBP | Indofood CBP Sukses Makmur | 6.925 | Konsumer/makanan | rendah–sedang |
| AMRT | Sumber Alfaria Trijaya | 1.065 | Ritel | sedang |
| GOTO | GoTo Gojek Tokopedia | 27 | Teknologi | SANGAT TINGGI (gorengan) |

IHSG awal 5.321. Harga-harga di atas adalah harga awal permainan; semua
pergerakan selanjutnya adalah SIMULASI dan diberi label demikian.

### Requirements

#### R1 — Layar menu
- **SHALL:** Game menampilkan layar menu dengan judul game, tombol
  "Mulai Main", tombol "Cara Main", high score terbaik (return % + gelar)
  bila ada, dan disclaimer simulasi.
- **WHEN** pemain membuka game pertama kali **THEN** menu tampil dan tidak
  ada layar kosong/loading tanpa status.

#### R2 — Cara main
- **SHALL:** Layar "Cara Main" menjelaskan dalam ≤6 poin singkat: modal,
  30 hari, lot 100, fee, berita, dan cara menang.
- **WHEN** pemain menekan "Cara Main" **THEN** penjelasan tampil dan tombol
  kembali ke menu berfungsi.

#### R3 — Papan pasar
- **SHALL:** Selama bermain, game menampilkan: hari ke-N dari 30, IHSG,
  kas, total nilai portofolio (kas + nilai saham), return % vs modal awal,
  dan daftar 8 saham dengan harga, perubahan hari ini (Rp + %), dan jumlah
  lot yang dimiliki.
- **WHEN** hari berganti **THEN** semua angka di atas diperbarui sesuai
  state terbaru.

#### R4 — Berita harian
- **SHALL:** Tiap hari (kecuali hari 1) game menampilkan 0–1 berita dari
  bank event (~28 event, data-driven) yang memengaruhi saham/sektor/pasar
  tertentu; berita tampil SEBELUM pemain bertransaksi hari itu.
- **WHEN** berita muncul **THEN** pemain bisa membaca headline + dampak
  yang dituju (saham/sektor) sebelum menekan "Tutup Pasar".

#### R5 — Beli saham
- **SHALL:** Pemain bisa membeli saham per lot (100 lembar) dengan pilihan
  jumlah 1/5/10 lot atau "Max"; harga = harga pasar + fee beli 0,15%;
  pembelian gagal dengan pesan jelas bila kas tidak cukup.
- **WHEN** pemain membeli N lot **THEN** kas berkurang sebesar
  N×100×harga×1,0015, holding bertambah N lot, dan transaksi tercatat di
  riwayat.

#### R6 — Jual saham
- **SHALL:** Pemain bisa menjual lot yang dimiliki (1/5/10 lot atau
  "Semua"); hasil = harga pasar − fee jual 0,25%; penjualan gagal dengan
  pesan jelas bila lot tidak cukup.
- **WHEN** pemain menjual N lot **THEN** kas bertambah sebesar
  N×100×harga×0,9975, holding berkurang N lot, dan transaksi tercatat.

#### R7 — Tutup pasar (lanjut hari)
- **SHALL:** Tombol "Tutup Pasar" menggerakkan semua harga satu hari
  (random walk per saham + efek event hari itu bila ada), memajukan hari,
  memperbarui IHSG, dan mengaplikasikan dividen bila event dividen aktif.
- **WHEN** hari mencapai 30 dan pasar ditutup **THEN** game berpindah ke
  layar hasil (bukan hari ke-31).

#### R8 — Dividen
- **SHALL:** Event dividen tertentu membayar tunai per lot yang dipegang
  pada hari event (masuk ke kas, tercatat di riwayat sebagai DIVIDEN).
- **WHEN** pemain memegang saham berdividen saat event aktif **THEN** kas
  bertambah sesuai jumlah lot × dividen per lot.

#### R9 — Grafik portofolio
- **SHALL:** Game menampilkan grafik garis nilai total portofolio per hari
  (canvas) dengan garis acuan modal awal Rp 10.000.000.
- **WHEN** hari berganti **THEN** satu titik baru ditambahkan ke grafik.

#### R10 — Riwayat transaksi
- **SHALL:** Game menyimpan dan menampilkan riwayat (hari, aksi
  BELI/JUAL/DIVIDEN, kode, lot, harga, total) dengan entri terbaru di atas.
- **WHEN** transaksi terjadi **THEN** entri muncul di riwayat pada hari
  yang sama.

#### R11 — Layar hasil + gelar
- **SHALL:** Setelah hari ke-30, game menampilkan total aset akhir,
  return %, dan gelar sesuai return: ≥+50% "Sultan Bursa", ≥+25%
  "Juragan Saham", ≥0% "Trader Bertahan", ≥−25% "Nyangkut di Pucuk",
  <−25% "Korban Gorengan"; plus 1 tips berdasarkan perilaku bermain
  (mis. terlalu sering trading → fee menggerogoti; all-in satu saham →
  diversifikasi).
- **WHEN** hasil tampil **THEN** gelar + angka konsisten dengan state
  akhir dan tombol "Main Lagi" memulai permainan baru.

#### R12 — High score
- **SHALL:** Return % terbaik + gelar terbaik tersimpan di localStorage
  dan tampil di menu; hasil baru yang lebih baik menimpa yang lama.
- **WHEN** permainan selesai dengan return lebih tinggi dari rekor
  **THEN** rekor diperbarui dan layar hasil menandainya ("Rekor Baru!").

#### R13 — Autosave + lanjutkan
- **SHALL:** State permainan tersimpan otomatis (localStorage, envelope
  berversi) setiap selesai aksi; bila ada save, menu menawarkan
  "Lanjutkan (Hari N)".
- **WHEN** pemain menutup lalu membuka kembali game di tengah permainan
  **THEN** permainan berlanjut dari hari terakhir yang tersimpan.

#### R14 — Ticker tape
- **SHALL:** Pita berjalan di atas layar menampilkan kode + harga +
  perubahan % 8 saham secara terus-menerus.
- **WHEN** harga berubah **THEN** isi pita diperbarui.

#### R15 — Suara + delight
- **SHALL:** Efek suara sederhana via WebAudio (klik, beli, jual, lonceng
  tutup pasar) dengan tombol mute; confetti (canvas/partikel DOM)
  muncul bila hasil akhir ≥+25%.
- **WHEN** pemain menekan mute **THEN** semua suara berhenti sampai
  dihidupkan lagi.

#### R16 — Tidak ada softlock
- **SHALL:** Tidak ada kondisi yang membuat game macet: tombol "Tutup
  Pasar" selalu tersedia saat bermain; bila kas habis dan tidak ada saham,
  pemain tetap bisa menutup pasar sampai hari ke-30.
- **WHEN** kas = 0 dan holding kosong **THEN** game tetap bisa dilanjutkan
  ke hari berikut (bukan macet).

#### R17 — Self-healing
- **SHALL:** Save yang rusak/version tidak dikenal ditangani dengan pesan
  + mulai permainan baru (bukan layar blank); error storage tidak
  mematikan game.
- **WHEN** localStorage berisi data korup **THEN** game menampilkan menu
  normal dengan save diabaikan.

#### R18 — Mobile-first + aksesibilitas
- **SHALL:** Layout mobile-first (nyaman di lebar 360px), tombol ≥44px,
  kontras teks ≥4.5:1, semua aksi bisa dicapai tanpa hover.
- **WHEN** dibuka di HP **THEN** tidak ada scroll horizontal dan semua
  kontrol bisa ditekan dengan jempol.
