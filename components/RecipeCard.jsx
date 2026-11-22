'use client';
import Link from 'next/link';
import { Clock, Edit3, Trash2, Eye, Heart, Check, Flame } from 'lucide-react';
import { useApp } from './AppProvider';
import { rupiah, SLOT_LABEL } from '@/lib/data';

export default function RecipeCard({
  recipe,
  aksiLabel = 'Pilih Menu',
  onAksi,
  terpilih = false,
  onEdit,
  onDelete,
  porsi = 1,
}) {
  const { favorit, toggleFavorit } = useApp();
  const suka = favorit?.includes(recipe.id);
  const harga = Math.round(recipe.harga * porsi);
  const bahanUtama = recipe.bahan.slice(0, 3).map((b) => b.nama).join(', ');

  return (
    <div className="card flex flex-col overflow-hidden !p-0 transition-shadow hover:shadow-md">
      {/* Kepala kartu */}
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-light to-brand-mint/60 text-7xl">
        <Link href={`/menu/${recipe.id}`} aria-label={`Lihat ${recipe.nama}`}>{recipe.emoji}</Link>
        {recipe.slot && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{SLOT_LABEL[recipe.slot]}</span>
        )}
        <button
          onClick={() => toggleFavorit(recipe.id)}
          aria-label={suka ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          aria-pressed={suka}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart size={16} className={suka ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
        </button>
        <span className="absolute bottom-3 left-3 text-lg font-extrabold text-brand-dark">
          {rupiah(harga)}{porsi > 1 && <span className="ml-1.5 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{porsi} porsi</span>}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm"><Flame size={12} className="text-accent" /> {Math.round(recipe.kalori * porsi)} kkal</span>
      </div>

      {/* Isi */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/menu/${recipe.id}`} className="line-clamp-2 font-extrabold leading-snug hover:text-brand-dark">{recipe.nama}</Link>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">Bahan: {bahanUtama}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5"><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-dark" />Protein {Math.round(recipe.protein * porsi)}g</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5"><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />Karbo {Math.round(recipe.karbo * porsi)}g</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5"><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />Serat {Math.round(recipe.serat * porsi)}g</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Clock size={11} /> {recipe.waktu} menit</div>

        <div className="mt-4 flex items-center gap-2">
          <Link href={`/menu/${recipe.id}`} title="Lihat resep" aria-label="Lihat resep" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark hover:bg-brand-mint"><Eye size={16} /></Link>
          {onEdit && (
            <button onClick={onEdit} title="Edit menu ini" aria-label="Edit menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark hover:bg-brand-mint"><Edit3 size={16} /></button>
          )}
          {onDelete && (
            <button onClick={onDelete} title="Hapus dari jadwal" aria-label="Hapus menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={16} /></button>
          )}
          {terpilih ? (
            <span className="btn flex-1 cursor-default bg-success-dark py-2.5 text-white"><Check size={16} /> Terpilih</span>
          ) : (
            <button onClick={onAksi} className="btn btn-primary flex-1 rounded-full py-2.5"><Check size={16} /> {aksiLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
