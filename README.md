# 🥗 NutriKos v2.0

> **Platform Rekomendasi Menu Bergizi & Hemat untuk Mahasiswa Perantau (Anak Kos) Berbasis AI & Cloud Database**  
> *Karya Lomba SEVENT X National Competition — Kategori Software Development / Website*  
> *Tema: Developing Sustainable Tech Solutions for Society (Mendukung SDG 2: Zero Hunger & Pola Konsumsi Berkelanjutan)*

🌐 **Live Demo:** [https://nutri-kos.vercel.app](https://nutri-kos.vercel.app)

---

## 📌 Latar Belakang & Solusi

Mahasiswa perantau sering kali menghadapi kendala dalam menjaga pola makan sehat karena keterbatasan anggaran, peralatan memasak seadanya (seperti hanya memiliki *rice cooker* atau kompor satu tungku), serta bahan makanan sisa yang sering terbuang (*food waste*). 

**NutriKos** hadir sebagai solusi berbasis web modern yang menggabungkan:
1. **Algoritma Rekomendasi Cerdas & Gemini AI** untuk menyusun rencana menu harian/mingguan yang tepat gizi dan ramah kantong.
2. **Pengolah Bahan Sisa** untuk memanfaatkan stok kulkas/meja kos menjadi masakan lezat.
3. **Database Cloud Supabase** yang menyinkronkan data profil, bahan, jadwal, dan daftar belanja antar perangkat secara aman dan *real-time*.

---

## ✨ Fitur-Fitur Utama

### 1. 🏠 Landing Page & Dashboard Personal
- **Landing Page Publik (`/`):** Tampilan beranda modern yang memperkenalkan fitur unggulan, simulasi hemat anggaran, dan akses cepat daftar/masuk.
- **Dashboard Beranda (`/beranda`):**
  - Pemantauan sisa anggaran makan hari ini dan skor pemenuhan gizi harian.
  - Grafik batang pengeluaran 7 hari (Senin–Minggu) dengan indikator status hemat bujet.
  - 4 indikator nutrisi visual (Kalori, Protein, Karbohidrat, Serat).
  - Jadwal makan aktif hari ini (Sarapan, Makan Siang, Makan Malam) dengan rincian biaya dan jam rekomendasi.

### 2. 🍲 Rekomendasi Menu & Katalog 50 Resep (`/menu`)
- **Katalog 50 Resep Lokal:** Berisi 50 resep masakan khas kos dengan 80 bahan baku variatif yang telah disesuaikan dengan batasan bujet dan alat masak.
- **Filter Cepat:** Filter waktu makan (*Semua, Sarapan, Makan Siang, Makan Malam*), kategori khusus (*Tinggi Protein, Cepat < 15 mnt, Rice Cooker, Kompor, < Rp10.000, Favorit*).
- **Pilihan Menu Lainnya & Paginasi:** Menampilkan rekomendasi pengganti dengan paginasi rapi (6 kartu per halaman) tanpa mengganggu menu utama.
- **Estimasi Total Otomatis:** Menghitung total biaya menu hari ini dan tombol sekali klik *"Terapkan ke Jadwal & Lihat Gizi"*.

### 3. 📖 Halaman Detail Resep Interaktif (`/menu/[id]`)
- Rincian estimasi biaya, kalori, makronutrisi, estimasi waktu masak, dan alat yang dibutuhkan.
- **Checklist Ketersediaan Bahan Realtime:** Pengguna dapat mengeklik bahan untuk menandai ketersediaannya di kos; sistem otomatis memperbarui stok bahan sisa di database dan menghitung sisa biaya belanja yang perlu dikeluarkan.

### 4. 🧊 Cek Bahan Sisa Kos (`/bahan-sisa`)
- Memasukkan bahan yang tersisa di kos (bisa memilih dari bahan populer atau mengetik manual).
- Sistem mencocokkan stok dengan katalog resep dan menyajikan masakan yang bisa diolah beserta persentase kecocokan bahan dan biaya tambahan yang dibutuhkan.

### 5. 🛒 Daftar Belanja Pintar (`/belanja`)
- Disinkronkan otomatis dari resep menu harian dan bahan yang belum tersedia di kos.
- Dikelompokkan rapi per kategori: Karbohidrat, Protein, Sayur, dan Bumbu.
- Fitur checklist saat berbelanja di warung/pasar, progres anggaran belanja, serta tombol **"Bagikan Daftar Belanja"** ke WhatsApp / Clipboard.

### 6. 📊 Pelacak Gizi Mingguan (`/gizi`)
- Melacak riwayat konsumsi selama seminggu penuh berpatokan pada standar Angka Kecukupan Gizi (AKG).
- Menghitung skor mingguan (*Cukup $\ge 80\%$, Perlu Ditingkatkan $50-79\%$, Kurang $< 50\%$*) serta memberikan catatan & rekomendasi nutrisi otomatis.

### 7. ⚙️ Profil Kos & Profil Pengguna
- **Profil Kos (`/profil-kos`):** Kustomisasi bujet harian (geser slider / tombol cepat), pemilihan alat masak (bisa menambah alat masak custom secara dinamis), pantangan/alergi makanan, dan kota lokasi kos.
- **Profil Saya (`/profil`):** Pengaturan nama lengkap, email, kampus, pilihan avatar, dan fasilitas ganti kata sandi.

### 8. 🤖 Asisten Konsultan Gizi "Tanya AI" (Gemini AI)
- Chatbot interaktif ramah mahasiswa yang menyapa pengguna dengan nama panggilan mereka.
- Menggunakan model Google Gemini (`gemini-3.5-flash`, `gemini-flash-lite-latest`, `gemini-3.8-flash`) dengan *fallback rule-based* otomatis.
- Mendukung pemahaman bahasa santai, pemilihan menu bernomor (*"mau yang no 2"*), dan negasi bahan (*"ga punya udang"*).
- Tampilan responsif berupa *Bottom Sheet Drawer* elegan di HP dan kartu melayang di desktop.

### 9. 🔔 Navigasi & Keamanan Terintegrasi
- **Fixed Header Universal:** Kotak pencarian resep dengan *live autocomplete dropdown*, lonceng notifikasi dinamis (pengingat belanja, evaluasi bujet & gizi), tombol drawer menu, dan avatar profil yang selalu melekat di atas saat halaman digulir.
- **Bottom Navigation Mobile:** 5 tab akses instan (*Beranda, Menu, Bahan, Belanja, Gizi*) yang pas di genggaman smartphone.
- **Autentikasi & RLS:** Pendaftaran akun dengan validasi kata sandi kuat, login aman via Supabase Auth, proteksi rute halaman via SSR Next.js Middleware (`middleware.js`), serta isolasi data per akun pengguna.

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | SSR, React Server Components, Middleware Routing |
| **Bahasa** | JavaScript (ES6+) / React 18 | Hooks (`useMemo`, `useState`, `useEffect`) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Mobile-first Responsive, Custom Color Palette, Utility Classes |
| **Ikon UI** | [Lucide React](https://lucide.dev/) | Konsisten & Ringan |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL) | Auth Cookies, 7 Tabel Relasional, Row Level Security |
| **AI / LLM** | [Google Gemini API](https://ai.google.dev/) | Rekomendasi Menu Cerdas & Chatbot Asisten Gizi |
| **Deployment** | [Vercel](https://vercel.com/) | CI/CD Otomatis terintegrasi GitHub |

---

## 🗄️ Struktur Database (Supabase PostgreSQL)

Aplikasi ini menggunakan 7 tabel utama di skema `public`:

```
├── pengguna            # Identitas user, nama, kampus, avatar
├── profil_kos          # Bujet harian, daftar alat masak (JSONB), pantangan, lokasi
├── bahan_sisa          # Daftar stok bahan makanan yang dimiliki di kos
├── jadwal_makan        # Jadwal menu terpilih hari ini (sarapan, siang, malam) + porsi
├── favorit             # Daftar ID resep yang ditandai sebagai favorit
├── riwayat_menu        # Riwayat konsumsi makanan harian untuk grafik & gizi
└── daftar_belanja      # Item belanja manual / tambahan di luar paket menu
```
*Script SQL pembuatan tabel dan policy RLS lengkap tersedia di folder `supabase/schema.sql`.*

---

## 💻 Panduan Menjalankan di Komputer Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 18.17 atau yang lebih baru.
- Akun [Supabase](https://supabase.com/) & Akun [Google AI Studio](https://aistudio.google.com/) (keduanya gratis).

### 2. Klon Repositori & Instal Dependensi
```bash
git clone https://github.com/SaraSafitri1804/NutriKos.git
cd NutriKos
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env.local` di root folder proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...kunci-anon-supabase-anda...
GEMINI_API_KEY=AIzaSy...kunci-gemini-ai-anda...
```

### 4. Eksekusi Skema Database
Buka dashboard Supabase Anda $\rightarrow$ **SQL Editor** $\rightarrow$ jalankan seluruh script dari file [supabase/schema.sql](file:///c:/Users/Hi/Desktop/NutriKos/supabase/schema.sql).

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000). *(Aplikasi dioptimalkan untuk tampilan smartphone maupun desktop).*

---

## 🚀 Panduan Deployment ke Vercel

1. Hubungkan repositori GitHub Anda ke akun [Vercel](https://vercel.com).
2. Pilih repositori **NutriKos** lalu klik **Import**.
3. Di bagian **Environment Variables**, tambahkan 3 variabel berikut:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Klik **Deploy**.
5. Setiap kali Anda melakukan `git push origin main`, Vercel akan otomatis melakukan *build* ulang dan memperbarui website secara instan!

---

## 📂 Struktur Direktori Proyek

```
NutriKos/
├── app/
│   ├── api/
│   │   ├── cek-supabase/route.js    # Endpoint uji koneksi database
│   │   └── rekomendasi/route.js     # Endpoint LLM Gemini AI & validasi aturan
│   ├── bahan-sisa/page.jsx          # Halaman cek & olah bahan sisa
│   ├── belanja/page.jsx             # Halaman daftar belanja & estimasi harga
│   ├── beranda/page.jsx             # Dashboard utama akun login
│   ├── gizi/page.jsx                # Halaman evaluasi & skor gizi mingguan
│   ├── login/page.jsx               # Form autentikasi login pengguna
│   ├── lupa-sandi/page.jsx          # Form permintaan reset password
│   ├── menu/
│   │   ├── [id]/page.jsx            # Detail resep & checklist bahan
│   │   └── page.jsx                 # Katalog menu, filter, & paket rekomendasi
│   ├── profil/page.jsx              # Profil akun & ganti sandi
│   ├── profil-kos/page.jsx          # Pengaturan bujet, alat, & pantangan kos
│   ├── register/page.jsx            # Pendaftaran akun baru
│   ├── reset-sandi/page.jsx         # Halaman pembaruan sandi baru
│   ├── globals.css                  # Tailwind styles & utility classes
│   ├── layout.jsx                   # Root layout, fonts, meta tags
│   └── page.jsx                     # Landing page utama publik
├── components/
│   ├── AppProvider.jsx              # Global state provider & kalkulasi lokal
│   ├── BottomNav.jsx                # 5 tab navigasi bawah khusus layar ponsel
│   ├── ChatAI.jsx                   # Widget interaktif Tanya AI (Gemini)
│   ├── Header.jsx                   # Fixed header: search, notif bell, profil
│   ├── RecipeCard.jsx               # Komponen kartu resep masakan serbaguna
│   ├── Ring.jsx                     # Komponen lingkaran persentase nutrisi
│   ├── Shell.jsx                    # Kerangka tata letak, proteksi rute & navigasi
│   ├── Sidebar.jsx                  # Drawer navigasi mobile & sidebar desktop
│   └── SinkronData.jsx              # Sinkronisasi data lokal ke Supabase database
├── lib/
│   ├── data.js                      # Database 50 resep & 80 bahan masakan kos
│   ├── recommend.js                 # Algoritma penyusunan menu & kalkulator gizi
│   ├── ai.js                        # Client handler request Gemini AI
│   └── supabase/                    # Inisialisasi Supabase client & server-side
├── supabase/
│   └── schema.sql                   # DDL skema tabel & kebijakan RLS Supabase
├── middleware.js                    # SSR Auth protection & routing redirect
└── package.json
```

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk keikutsertaan dalam **SEVENT X National Competition**.  
© 2026 **NutriKos Team** — All Rights Reserved.
