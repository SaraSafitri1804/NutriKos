'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useApp } from './AppProvider';

export default function Header() {
  const router = useRouter();
  const { profile, toggleSidebar } = useApp();
  const [cari, setCari] = useState('');

  const kirim = (e) => {
    e.preventDefault();
    const q = cari.trim();
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : '/menu');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-3 bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={toggleSidebar}
        aria-label="Buka Menu Navigasi"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white lg:hidden"
      >
        <Menu size={22} />
      </button>

      <form onSubmit={kirim} className="relative max-w-md flex-1">
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari menu, bahan, atau resep..."
          aria-label="Cari menu"
          className="w-full rounded-full border-0 bg-white py-2.5 pl-4 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button type="submit" aria-label="Cari" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Search size={18} />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button aria-label="Notifikasi" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:text-brand-dark">
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <Link href="/profil" className="flex items-center gap-2.5 border-l border-slate-200 pl-3" aria-label="Profil Saya">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-xl ring-2 ring-brand-mint">
            {profile?.avatar || '👩‍🎓'}
          </span>
          <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-slate-800 sm:block">{profile?.nama}</span>
        </Link>
      </div>
    </header>
  );
}
