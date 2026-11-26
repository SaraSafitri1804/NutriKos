import Link from 'next/link';
import { Sparkles, Refrigerator, ShoppingBag, HeartPulse, ArrowRight, Wallet } from 'lucide-react';
import { RECIPES, SLOT_LABEL, rupiah } from '@/lib/data';

export const metadata = { title: 'NutriKos - Menu Bergizi & Hemat untuk Anak Kos' };

const FITUR = [
  { Icon: Sparkles, judul: 'Menu AI', teks: 'Sesuai bujet & alat masak' },
  { Icon: Refrigerator, judul: 'Bahan Sisa', teks: 'Ide masak dari stok kos' },
  { Icon: ShoppingBag, judul: 'Daftar Belanja', teks: 'Otomatis & estimasi harga' },
  { Icon: HeartPulse, judul: 'Pantau Gizi', teks: 'Kalori, protein & serat harian' },
];

export default function LandingPage() {
  const contoh = ['pagi', 'siang', 'malam'].map((s) => RECIPES.find((r) => r.slot === s)).filter(Boolean);
  const total = contoh.reduce((s, r) => s + r.harga, 0);
  const kalori = contoh.reduce((s, r) => s + r.kalori, 0);

  return (
    <div className="min-h-screen bg-surface text-slate-800">
      {/* Navigasi */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo NutriKos" className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
          <span className="text-xl font-extrabold">NutriKos</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-brand-dark hover:bg-white">Masuk</Link>
          <Link href="/register" className="rounded-full bg-brand-dark px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-deeper">Daftar</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-12 pt-6 lg:grid-cols-2 lg:pt-12">
        <div className="min-w-0">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Makan bergizi, <span className="text-brand-dark">uang saku aman.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-600 sm:text-lg">
            Atur menu sehat harian sesuai bujet dan alat masak di kos.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-7 py-3.5 text-base font-bold text-white shadow-lg hover:bg-brand-deeper">
              Mulai Gratis <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="rounded-full bg-white px-7 py-3.5 text-base font-bold text-brand-dark shadow-sm hover:bg-brand-light">
              Masuk
            </Link>
          </div>
        </div>

        {/* Contoh tampilan */}
        <div className="min-w-0 rounded-3xl bg-white p-5 shadow-xl sm:p-6" aria-label="Contoh menu hari ini">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Contoh menu hari ini</div>
              <div className="text-lg font-extrabold">Bujet Rp 30.000 / hari</div>
            </div>
            <span className="rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark">
              Hemat {Math.max(0, Math.round((1 - total / 30000) * 100))}%
            </span>
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

      {/* Fitur */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FITUR.map(({ Icon, judul, teks }) => (
            <div key={judul} className="rounded-2xl bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark"><Icon size={20} /></span>
              <h3 className="mt-3 font-extrabold">{judul}</h3>
              <p className="mt-1 text-sm text-slate-500">{teks}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-slate-400">
        © 2026 NutriKos
      </footer>
    </div>
  );
}
