# The Last One

Kartu ulang tahun interaktif untuk Silvia: sebuah buku yang dibalik halaman demi halaman, lalu berlanjut ke jurnal pribadi.

## Halaman

| File | Isi |
| --- | --- |
| `index.html` | Buku ucapan: sampul, PIN tanggal lahir, empat halaman isi, dan halaman hadiah. |
| `book.css` | Tema buku (kertas, kulit, emas), animasi balik halaman, dan mode siang–malam. |
| `book.js` | Logika halaman, PIN, audio, slider jam, canvas langit, dan gestur geser. |
| `dashboard.html` | Jurnal suasana hati: gerbang password, mood tracker, kutipan, galeri foto. |
| `dashboard.css` | Tema jurnal yang menyatu dengan buku. |

## Menjalankan

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000/`. Jangan buka lewat `file://` karena audio dan font butuh server.

## Kontrol

- **PIN** — empat digit tanggal dan bulan lahir; petunjuk ada di halaman pertama.
- **Panah / geser / tombol panah keyboard** — balik halaman.
- **Slider jam (0–23)** — mengubah langit, warna, dan suasana siang–malam.
- **Halaman hadiah** — membuka `dashboard.html`; ada juga tombol ulang untuk menonton lagi.
- **Galeri** — klik foto untuk memperbesar; `Esc` atau klik latar untuk menutup.

## Catatan

- Situs statis murni, tanpa build step. Font diambil dari Google Fonts.
- PIN dan password tersimpan di sisi klien karena ini situs statis; jangan dipakai untuk data sensitif.
- `bg.mp3` adalah lagu utama dan diputar setelah PIN benar.
- Berkas `style.css` dan `script.js` adalah sisa versi lama dan tidak lagi dimuat halaman mana pun.
