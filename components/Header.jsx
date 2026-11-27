'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, Clock, HeartPulse, Menu, Refrigerator, Search, ShoppingBag, UtensilsCrossed, X } from 'lucide-react';
import { useApp } from './AppProvider';
import { getRecipe, RECIPES, rupiah, SLOT_LABEL, targetGizi } from '@/lib/data';
import { ideasFromStock, nutrisiDari } from '@/lib/recommend';

export default function Header() {
  const router = useRouter();
  const { profile, plan, customPlanDetails, getShoppingItems, checked, toggleSidebar, ready } = useApp();
  const [cari, setCari] = useState('');
  const [bukaCari, setBukaCari] = useState(false);
  const [bukaNotif, setBukaNotif] = useState(false);
  const [sudahDibaca, setSudahDibaca] = useState(false);
  const notifRef = useRef(null);
  const cariRef = useRef(null);

  useEffect(() => {
    const tutupLuar = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setBukaNotif(false);
      if (cariRef.current && !cariRef.current.contains(e.target)) setBukaCari(false);
    };
    const tutupEsc = (e) => {
      if (e.key === 'Escape') {
        setBukaNotif(false);
        setBukaCari(false);
      }
    };
    document.addEventListener('mousedown', tutupLuar);
    document.addEventListener('keydown', tutupEsc);
    return () => {
      document.removeEventListener('mousedown', tutupLuar);
      document.removeEventListener('keydown', tutupEsc);
    };
  }, []);

  const hasilCari = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return [];
    return RECIPES.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        (SLOT_LABEL[r.slot] || '').toLowerCase().includes(q) ||
        r.bahan.some((b) => b.nama.toLowerCase().includes(q) || b.kunci.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [cari]);

  const notifikasi = useMemo(() => {
    if (!ready) return [];
    const list = [];
    const items = getShoppingItems ? getShoppingItems() : [];
    const perluDibeli = items.filter((x) => !x.sudahAda && !checked[x.nama]);
    if (perluDibeli.length > 0) {
      list.push({
        id: 'belanja',
        href: '/belanja',
        Icon: ShoppingBag,
        warna: 'bg-brand-light text-brand-dark',
        judul: `${perluDibeli.length} bahan perlu dibeli`,
        ket: 'Cek daftar belanja hari ini',
      });
    }

    const resep = (plan || []).map(getRecipe).filter(Boolean);
    if (resep.length === 0) {
      list.push({
        id: 'menu-kosong',
        href: '/menu',
        Icon: UtensilsCrossed,
        warna: 'bg-accent-light text-amber-700',
        judul: 'Belum ada menu hari ini',
        ket: 'Buat rekomendasi menu sesuai bujetmu',
      });
    } else {
      const n = nutrisiDari(plan, customPlanDetails);
      const T = targetGizi(profile);
      const skor = Math.round(((Math.min(1, n.protein / T.protein) + Math.min(1, n.serat / T.serat) + Math.min(1, n.karbo / T.karbo)) / 3) * 100);
      if (n.biaya > profile.budget) {
        list.push({
          id: 'bujet-lebih',
          href: '/menu',
          Icon: UtensilsCrossed,
          warna: 'bg-red-50 text-red-600',
          judul: 'Melebihi bujet harian',
          ket: `Total ${rupiah(n.biaya)} dari batas ${rupiah(profile.budget)}`,
        });
      }
      if (skor < 70) {
        list.push({
          id: 'gizi-rendah',
          href: '/gizi',
          Icon: HeartPulse,
          warna: 'bg-accent-light text-amber-700',
          judul: `Skor gizi hari ini ${skor}%`,
          ket: 'Pantau asupan protein & seratmu',
        });
      }
    }

    const ide = ideasFromStock(profile);
    if ((profile?.stok || []).length === 0) {
      list.push({
        id: 'stok-kosong',
        href: '/bahan-sisa',
        Icon: Refrigerator,
        warna: 'bg-success-light text-success-dark',
        judul: 'Stok bahan kos masih kosong',
        ket: 'Tambahkan bahan sisa untuk ide masak',
      });
    } else if (ide.length > 0) {
      list.push({
        id: 'ide-stok',
        href: '/bahan-sisa',
        Icon: Refrigerator,
        warna: 'bg-success-light text-success-dark',
        judul: `${ide.length} ide masak dari bahan kos`,
        ket: `Terdekat: ${ide[0].recipe.nama}`,
      });
    }

    return list;
  }, [ready, getShoppingItems, checked, plan, customPlanDetails, profile]);

  const kirim = (e) => {
    e.preventDefault();
    const q = cari.trim();
    setBukaCari(false);
    window.dispatchEvent(new CustomEvent('nutrikos-search', { detail: q.toLowerCase() }));
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : '/menu');
  };

  const toggleNotif = () => {
    setBukaNotif((v) => !v);
    setSudahDibaca(true);
  };

  const adaBelumDibaca = !sudahDibaca && notifikasi.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-72 z-40 flex h-16 items-center gap-3 bg-surface/95 px-3.5 backdrop-blur sm:px-6 lg:px-8 border-b border-slate-200/60 shadow-xs">
      <button
        onClick={toggleSidebar}
        aria-label="Buka Menu Navigasi"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div ref={cariRef} className="relative flex-1 min-w-0 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <form onSubmit={kirim} className="relative">
          <input
            value={cari}
            onFocus={() => setBukaCari(true)}
            onChange={(e) => { setCari(e.target.value); setBukaCari(true); }}
            placeholder="Cari menu / bahan..."
            aria-label="Cari menu"
            className="w-full rounded-full border border-slate-200/70 bg-white py-2 pl-3.5 pr-14 text-xs sm:text-sm sm:py-2.5 sm:pl-4 sm:pr-16 shadow-xs outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {cari && (
            <button
              type="button"
              onClick={() => {
                setCari('');
                window.dispatchEvent(new CustomEvent('nutrikos-search', { detail: '' }));
              }}
              aria-label="Hapus pencarian"
              className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            aria-label="Cari"
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-brand-light hover:text-brand-dark"
          >
            <Search size={17} />
          </button>
        </form>

        {bukaCari && cari.trim() && (
          <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl z-50">
            {hasilCari.length === 0 ? (
              <div className="px-4 py-4 text-center text-xs text-slate-500">
                Tidak ada resep untuk &ldquo;{cari.trim()}&rdquo;.
              </div>
            ) : (
              <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                {hasilCari.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/menu/${r.id}`}
                      onClick={() => setBukaCari(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-lg">{r.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-800">{r.nama}</span>
                        <span className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{rupiah(r.harga)}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5"><Clock size={10} /> {r.waktu} mnt</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={kirim}
              className="w-full border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs font-bold text-brand-dark hover:bg-brand-light"
            >
              Lihat semua hasil di halaman Menu
            </button>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotif}
            aria-label="Notifikasi"
            aria-expanded={bukaNotif}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:text-brand-dark"
          >
            <Bell size={19} />
            {adaBelumDibaca && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />}
          </button>

          {bukaNotif && (
            <div
              role="region"
              aria-label="Daftar Notifikasi"
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-extrabold text-slate-800">Notifikasi</span>
                {notifikasi.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <CheckCheck size={13} /> {notifikasi.length} info
                  </span>
                )}
              </div>

              {notifikasi.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-500">
                  Semua beres! Tidak ada pengingat saat ini.
                </div>
              ) : (
                <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                  {notifikasi.map(({ id, href, Icon, warna, judul, ket }) => (
                    <li key={id}>
                      <Link
                        href={href}
                        onClick={() => setBukaNotif(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${warna}`}>
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-800">{judul}</span>
                          <span className="block truncate text-[11px] text-slate-500">{ket}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

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
