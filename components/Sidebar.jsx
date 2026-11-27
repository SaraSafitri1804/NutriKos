'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

function Logo({ onClick }) {
  return (
    <Link href="/beranda" onClick={onClick} className="flex items-center gap-3 px-6 pb-6 pt-6">
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

  // Tangani tombol Escape dan kunci scroll background saat drawer sidebar terbuka
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handleEsc);
    // Set/clear overflow berdasarkan state sidebar (bukan di cleanup)
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isSidebarOpen, closeSidebar]);

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
      <button onClick={keluar} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
        <LogOut size={19} /> Log Out
      </button>
      <div className="text-center text-[11px] text-white/60">NutriKos v2.0 · Pola Makan Sehat &amp; Hemat</div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isSidebarOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isSidebarOpen}
    >
      {/* Backdrop redup blur */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Panel Drawer Sidebar yang meluncur dari kiri dengan animasi */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 flex-col overflow-y-auto rounded-r-3xl sm:rounded-r-[2.5rem] bg-brand-dark shadow-2xl transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu Navigasi NutriKos"
      >
        <button
          onClick={closeSidebar}
          aria-label="Tutup menu"
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        <Logo onClick={closeSidebar} />
        {navContent}
        {footer}
      </aside>
    </div>
  );
}
