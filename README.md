# The Last One

Kartu ulang tahun interaktif untuk Silvia: sebuah buku yang dibalik halaman demi halaman, lalu berlanjut ke jurnal pribadi.

## Halaman

| File | Isi |
| --- | --- |
| `index.html` | Buku ucapan: sampul, PIN tanggal lahir, empat halaman isi, dan halaman hadiah. |
| `book.css` | Tema buku (kertas, kulit, emas), animasi balik halaman, dan mode siang–malam. |
| `book.js` | Logika halaman, PIN, audio, slider jam, canvas langit, dan gestur geser. |
| `dashboard.html` | Katalog mini game dan arena permainan ritme 4-jalur (**Nocturne Keys**). |
| `dashboard.css` | Tema katalog & kabinet game yang menyatu dengan buku. |
| `rhythm.js` | Mesin permainan ritme, melodi kustom Web Audio API, dan penilaian akurasi. |
| `sw.js` & `sw-register.js` | Service Worker untuk precache aset inti (~115 KB) dan strategi Network-First pada HTML. |

## Menjalankan

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000/`. Jangan buka lewat `file://` karena audio dan font butuh server.

## Kontrol

- **PIN** — empat digit tanggal dan bulan lahir; petunjuk ada di halaman pertama.
- **Panah / geser / tombol panah keyboard** — balik halaman.
- **Slider jam (0–23)** — mengubah langit, warna, dan suasana siang–malam.
- **Halaman hadiah & shortcut** — katalog mini game (`dashboard.html`) bisa dibuka langsung tanpa password lewat shortcut di popup awal, pojok kiri atas, atau halaman PIN; di halaman akhir juga ada tombol ulang untuk menonton lagi.
- **Nocturne Keys** — tekan `D`, `F`, `J`, `K` (atau ketuk 4 tombol di layar) saat not menyentuh garis emas; `Space` untuk jeda/lanjut.

## Catatan

- Situs statis murni, tanpa build step. Font diambil dari Google Fonts.
- PIN buku ucapan (`2404`) tersimpan di sisi klien karena ini situs statis; jangan dipakai untuk data sensitif. Katalog mini game tidak memakai password.
- Setiap update web, naikkan versi `?v=` dan `CORE_VERSION` di `sw.js` agar cache kode lama otomatis dibersihkan saat aktif.
- `bg.mp3` adalah lagu utama dan diputar setelah PIN benar.
- Berkas `style.css` dan `script.js` adalah sisa versi lama dan tidak lagi dimuat halaman mana pun.
