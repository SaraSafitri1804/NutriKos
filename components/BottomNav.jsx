'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, HeartPulse } from 'lucide-react';
import { useApp } from './AppProvider';
import { buildShopping } from '@/lib/recommend';

const TABS = [
  { href: '/beranda', label: 'Beranda', Icon: Home },
  { href: '/menu', label: 'Menu', Icon: UtensilsCrossed },
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
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, Icon }) => (
          <li key={href} className="flex-1">
            <Link href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${aktif(href) ? 'text-brand-dark' : 'text-slate-500'}`}>
              <Icon size={24} />
              {label}
              {href === '/belanja' && perluDibeli > 0 && (
                <span className="absolute right-[28%] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{perluDibeli}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
