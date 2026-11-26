'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Refrigerator, ShoppingBag, HeartPulse } from 'lucide-react';
import { useApp } from './AppProvider';

const TABS = [
  { href: '/beranda', label: 'Beranda', Icon: Home },
  { href: '/menu', label: 'Menu', Icon: UtensilsCrossed },
  { href: '/bahan-sisa', label: 'Bahan', Icon: Refrigerator },
  { href: '/belanja', label: 'Belanja', Icon: ShoppingBag },
  { href: '/gizi', label: 'Gizi', Icon: HeartPulse },
];

export default function BottomNav() {
  const path = usePathname();
  const { getShoppingItems, checked } = useApp();
  const items = getShoppingItems ? getShoppingItems() : [];
  const perluDibeli = items.filter((x) => !x.sudahAda && !checked[x.nama]).length;
  const aktif = (h) => path === h || (h !== '/beranda' && path.startsWith(`${h}/`));
  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden shadow-lg">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, Icon }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${
                aktif(href) ? 'text-brand-dark font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={aktif(href) ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span>{label}</span>
              {href === '/belanja' && perluDibeli > 0 && (
                <span className="absolute right-[22%] top-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                  {perluDibeli}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
