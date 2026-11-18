# Tasks — SAHAM! Juragan Saham

- [x] Explore: riset ide + harga saham IDX 18 Nov 2026 (grounded)
- [x] Propose: proposal.md, spec.md, design.md, tasks.md
- [x] Balance: simulasi 1000 sesi (subagent) → konstanta final dipakai:
  event 45%/hari, efek saham 5–15% (55% positif), efek pasar 2–5%
  (50% positif), drift +0,08%, lantai harga Rp 0,5. Target random
  trader <0% direvisi (lihat design.md) — ranking sudah benar.
- [ ] Apply 1: kerangka artifact (index.html + styles.css + app.js)
  — token desain, layout mobile-first, ticker tape
- [ ] Apply 2: data saham + bank event (~28 event) + engine harga
  (random walk + event + fee + dividen + IHSG)
- [ ] Apply 3: layar menu + cara main + disclaimer + high score
- [ ] Apply 4: layar bermain — aset, berita, daftar saham, panel beli/jual,
  grafik canvas, riwayat, tombol Tutup Pasar
- [ ] Apply 5: layar hasil — gelar, tips, rekor baru, confetti; autosave
  + lanjutkan; suara WebAudio + mute
- [ ] Apply 6: delight pass — stagger, flash harga, toast, shake tutup
  pasar, reduced-motion
- [ ] Verify 1: uji engine di Node (30 hari, harga > 0, fee konsisten)
- [ ] Verify 2: uji alur penuh di jsdom (menu → main → 30 hari → hasil →
  main lagi; kas 0 tetap bisa lanjut)
- [ ] Verify 3: trace SHALL R1–R18 ke build; cek CODE_STANDARDS +
  ARCHITECTURE (tidak ada god file >300 baris tanpa pemecahan logis,
  tidak ada secret, tidak ada placeholder)
- [ ] Archive: pindah change ke openspec/changes/archive/2026-11-19-saham/
- [ ] README lengkap + export artifact ke src/ + cek source ada
- [ ] Git init + commit; buat repo junanda24/daily-saham; push; verifikasi
  via API (source ADA di listing)
- [ ] Update BUILT.md + profile README junanda24/junanda24 (tabel harian)
- [ ] Log ke ~/memory/2026-11-19.md + tracking entry goal
- [ ] Antar hasil ke Junan (final message)
