import Link from 'next/link';
import { Sparkles, Refrigerator, ShoppingBag, HeartPulse, Heart, Home, ArrowRight, Wallet, ChefHat, Leaf, Check } from 'lucide-react';
import { RECIPES, SLOT_LABEL, rupiah } from '@/lib/data';

export const metadata = { title: 'NutriKos - Menu Bergizi & Hemat untuk Anak Kos' };

const FITUR = [
  { Icon: Sparkles, judul: 'Rekomendasi menu AI', teks: 'Menu pagi, siang, dan malam yang pas dengan bujet, alat masak, dan pantanganmu.' },
  { Icon: Refrigerator, judul: 'Cek bahan sisa', teks: 'Masukkan bahan yang ada di kos, dapatkan ide masakan agar tidak ada yang terbuang.' },
  { Icon: ShoppingBag, judul: 'Daftar belanja otomatis', teks: 'Hanya bahan yang belum kamu punya, lengkap dengan estimasi biaya.' },
  { Icon: HeartPulse, judul: 'Pelacak gizi mingguan', teks: 'Lihat protein, karbohidrat, dan serat dibanding Angka Kecukupan Gizi (AKG).' },
  { Icon: Heart, judul: 'Favorit & riwayat', teks: 'Simpan menu andalan dan catat apa yang sudah kamu makan.' },
  { Icon: Home, judul: 'Profil kos', teks: 'Atur bujet harian dan alat masak sekali, rekomendasi menyesuaikan.' },
];
const FAKTA = [
  { angka: '96,7%', teks: 'penduduk usia 5 tahun ke atas kurang mengonsumsi sayur dan buah (SKI 2023).' },
  { angka: '80%', teks: 'limbah pangan di tahap konsumsi berasal dari rumah tangga (Bappenas).' },
  { angka: 'Lebih rentan', teks: 'mahasiswa yang tinggal di kos berisiko lebih besar mengalami kerawanan pangan (UNTIRTA).' },
];
const LANGKAH = [
  { n: '1', judul: 'Isi profil kos', teks: 'Bujet harian, alat masak, dan pantangan.' },
  { n: '2', judul: 'Dapatkan menu', teks: 'Rekomendasi bergizi dengan resep singkat dan estimasi biaya.' },
  { n: '3', judul: 'Belanja & pantau gizi', teks: 'Ikuti daftar belanja, lalu lihat skor gizi mingguanmu.' },
];

export default function Mulai() {
  const contoh = ['pagi', 'siang', 'malam'].map((s) => RECIPES.find((r) => r.slot === s)).filter(Boolean);
  const total = contoh.reduce((s, r) => s + r.harga, 0);
  const kalori = contoh.reduce((s, r) => s + r.kalori, 0);

  return (
    <div className="min-h-screen bg-surface text-slate-800">
      {/* Navigasi */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/mulai" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo NutriKos" className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
          <span className="text-xl font-extrabold">NutriKos</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-brand-dark hover:bg-white">Masuk</Link>
          <Link href="/register" className="rounded-full bg-brand-dark px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-deeper">Daftar Gratis</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-6 lg:grid-cols-2 lg:pt-12">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark"><Leaf size={13} /> Mendukung SDG 2: Tanpa Kelaparan</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Makan bergizi, <span className="text-brand-dark">uang saku tetap aman.</span></h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">NutriKos membantu mahasiswa perantau menyusun menu sehat sesuai bujet harian, alat masak di kos, dan bahan yang sudah ada.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-7 py-3.5 text-base font-bold text-white shadow-lg hover:bg-brand-deeper">Mulai Gratis <ArrowRight size={18} /></Link>
            <Link href="/login" className="rounded-full bg-white px-7 py-3.5 text-base font-bold text-brand-dark shadow-sm hover:bg-brand-light">Sudah punya akun? Masuk</Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {['Gratis untuk mahasiswa', 'Ringan, tanpa unduh aplikasi', 'Sesuai rice cooker dan kompor kos'].map((t) => <li key={t} className="flex items-center gap-1.5"><Check size={15} className="text-success" /> {t}</li>)}
          </ul>
        </div>

        {/* Contoh tampilan */}
        <div className="min-w-0 rounded-3xl bg-white p-5 shadow-xl sm:p-6" aria-label="Contoh menu hari ini">
          <div className="mb-4 flex items-center justify-between">
            <div><div className="text-xs font-semibold text-slate-500">Contoh menu hari ini</div><div className="text-lg font-extrabold">Bujet Rp 30.000 / hari</div></div>
            <span className="rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark">Hemat {Math.max(0, Math.round((1 - total / 30000) * 100))}%</span>
          </div>
          <ul className="space-y-3">
            {contoh.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-light text-3xl">{r.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-500">{SLOT_LABEL[r.slot]}</span>
                  <span className="block truncate font-bold">{r.nama}</span>
                  <span className="text-xs text-slate-500">{r.waktu} menit · {r.kalori} kkal</span>
                </span>
                <span className="font-extrabold text-brand-dark">{rupiah(r.harga)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-dark px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-semibold"><Wallet size={16} /> Total {kalori} kkal</span>
            <span className="text-lg font-extrabold">{rupiah(total)}</span>
          </div>
        </div>
      </section>

      {/* Masalah */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Kenapa anak kos perlu NutriKos?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {FAKTA.map((f) => (
              <div key={f.angka} className="rounded-2xl bg-surface p-6">
                <div className="text-3xl font-extrabold text-brand-dark">{f.angka}</div>
                <p className="mt-2 text-sm text-slate-600">{f.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Semua yang kamu perlukan untuk makan sehat di kos</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FITUR.map(({ Icon, judul, teks }) => (
            <div key={judul} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand-dark"><Icon size={22} /></span>
              <h3 className="mt-4 font-extrabold">{judul}</h3>
              <p className="mt-1 text-sm text-slate-600">{teks}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="bg-brand-dark py-14 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Cara kerjanya</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {LANGKAH.map((l) => (
              <div key={l.n} className="rounded-2xl bg-white/10 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-extrabold text-brand-dark">{l.n}</span>
                <h3 className="mt-4 text-lg font-extrabold">{l.judul}</h3>
                <p className="mt-1 text-sm text-white/80">{l.teks}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-brand-dark shadow-lg hover:bg-brand-light"><ChefHat size={18} /> Buat Akun Gratis</Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-xs text-slate-500">
        <p>Rekomendasi gizi di NutriKos bersifat panduan umum dan bukan pengganti saran tenaga kesehatan atau ahli gizi. Estimasi harga bersifat perkiraan.</p>
        <p className="mt-2">© 2026 NutriKos · Tim CODIVA, Universitas Nahdlatul Ulama Indonesia (UNUSIA)</p>
      </footer>
    </div>
  );
}
