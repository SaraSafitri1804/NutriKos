'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, HeartPulse, User, Settings, Refrigerator, X, LogOut } from 'lucide-react';
import { useApp } from './AppProvider';
import { supabaseBrowser } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/beranda', label: 'Beranda', Icon: Home },
  { href: '/menu', label: 'Rekomendasi Menu', Icon: UtensilsCrossed },
  { href: '/bahan-sisa', label: 'Cek Bahan Sisa', Icon: Refrigerator },
  { href: '/belanja', label: 'Daftar Belanja', Icon: ShoppingBag },
  { href: '/gizi', label: 'Gizi Mingguan', Icon: HeartPulse },
  { href: '/profil-kos', label: 'Profil Kos', Icon: Settings },
  { href: '/profil', label: 'Profil Saya', Icon: User },
];

function Logo() {
  return (
    <Link href="/beranda" className="flex items-center gap-3 px-6 pb-6 pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Logo NutriKos" className="h-10 w-10 rounded-xl bg-white object-contain p-1" />
      <span className="text-2xl font-extrabold tracking-tight text-white">NutriKos</span>
    </Link>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { getShoppingItems, checked, isSidebarOpen, closeSidebar, reset } = useApp();
  const keluar = async () => {
    try { await supabaseBrowser().auth.signOut(); } catch (e) { /* tetap keluar di sisi aplikasi */ }
    reset(); // hapus data lokal agar tidak terlihat akun berikutnya di perangkat ini
    closeSidebar();
    router.push('/');
    router.refresh();
  };

  const shoppingItems = getShoppingItems ? getShoppingItems() : [];
  const perluDibeli = shoppingItems.filter((x) => !x.sudahAda && !checked[x.nama]).length;
  const aktif = (h) => path === h || (h !== '/beranda' && path.startsWith(`${h}/`));

  const navContent = (
    <nav className="flex-1 space-y-1.5 pl-4 pr-0">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = aktif(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={closeSidebar}
            className={`flex items-center gap-3 rounded-l-full py-3 pl-5 pr-4 text-sm font-semibold transition-colors ${
              isActive ? 'bg-white text-brand-dark shadow-sm' : 'text-white/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={19} />
            <span>{label}</span>
            {href === '/belanja' && perluDibeli > 0 && (
              <span className={`ml-auto mr-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${isActive ? 'bg-brand-dark text-white' : 'bg-accent text-white'}`}>
                {perluDibeli}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-3 p-5">
      <button onClick={keluar} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white">
        <LogOut size={19} /> Log Out
      </button>
      <div className="text-center text-[11px] text-white/60">NutriKos v2.0 · Pola Makan Sehat &amp; Hemat</div>
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar biru setinggi layar */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:rounded-br-[3rem] lg:bg-brand-dark">
        <Logo />
        {navContent}
        {footer}
      </aside>

      {/* Mobile: drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50" onClick={closeSidebar} aria-hidden="true" />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto rounded-br-[3rem] bg-brand-dark shadow-2xl">
            <button onClick={closeSidebar} aria-label="Tutup menu" className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10">
              <X size={20} />
            </button>
            <Logo />
            {navContent}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
