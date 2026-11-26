'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, X, Sparkles, Clock } from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import { ideasFromStock } from '@/lib/recommend';
import { mintaAI } from '@/lib/ai';
import { rupiah } from '@/lib/data';

const POPULER = ['Tahu', 'Wortel', 'Kecap Manis', 'Cabai Rawit', 'Bayam', 'Telur', 'Nasi', 'Kangkung'];

export default function BahanSisa() {
  const { profile, setProfile, ready } = useApp();
  const [input, setInput] = useState('');
  const [hasil, setHasil] = useState(null);
  const [aiInfo, setAiInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  if (!ready) return null;

  const tambah = (nama) => {
    const v = nama.trim();
    if (!v || profile.stok.some((s) => s.toLowerCase() === v.toLowerCase())) return;
    setProfile({ stok: [...profile.stok, v] });
    setInput('');
  };
  const cari = async () => {
    setLoading(true);
    const lokal = ideasFromStock(profile);
    const res = await mintaAI('bahan', profile);
    if (res && res.ids?.length) {
      const pilihan = res.ids.map((id) => lokal.find((x) => x.recipe.id === id)).filter(Boolean);
      const sisa = lokal.filter((x) => !res.ids.includes(x.recipe.id));
      setHasil([...pilihan, ...sisa]);
      setAiInfo({ alasan: res.alasan, sumber: res.sumber });
    } else { setHasil(lokal); setAiInfo(null); }
    setLoading(false);
  };
  const list = hasil || ideasFromStock(profile);

  return (
    <div className="space-y-4 md:space-y-5">
      <div><h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">Cek Bahan Sisa</h1><p className="text-slate-600 sm:text-lg">Olah stok bahan di kosan biar hemat & nggak mubazir</p></div>
      <div className="rounded-2xl bg-accent-light p-4 text-sm text-amber-900"><b>Hemat sampai Rp15.000 / hari.</b> Kreasikan stok kulkas & meja kos tanpa perlu beli lauk baru.</div>

      {/* Input bahan */}
      <div className="flex gap-2">
        <input className="input" placeholder="Ketik nama bahan (misal: Bawang, Tahu)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tambah(input)} />
        <button className="btn btn-primary shrink-0" onClick={() => tambah(input)}><Plus size={18} /> <span className="hidden sm:inline">Tambah</span></button>
      </div>

      {/* Bahan populer */}
      <div>
        <div className="label">Cepat tambah bahan kos populer:</div>
        <div className="w-full max-w-full overflow-x-auto flex gap-2 pb-2 lg:flex-wrap scrollbar-hide">
          {POPULER.filter((p) => !profile.stok.some((s) => s.toLowerCase() === p.toLowerCase())).map((p) => <button key={p} onClick={() => tambah(p)} className="chip shrink-0 bg-white">+ {p}</button>)}
        </div>
      </div>

      {/* Current ingredients */}
      <section className="card">
        <div className="mb-2 flex flex-wrap justify-between gap-2"><h2 className="font-extrabold">Bahan Kamu Saat Ini ({profile.stok.length} Bahan)</h2><span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">Siap Olah</span></div>
        <div className="flex flex-wrap gap-2">
          {profile.stok.length === 0 && <span className="text-sm text-slate-500">Belum ada bahan. Tambahkan dulu ya.</span>}
          {profile.stok.map((s) => <span key={s} className="chip">{s}<button aria-label={`Hapus ${s}`} onClick={() => setProfile({ stok: profile.stok.filter((x) => x !== s) })}><X size={14} /></button></span>)}
        </div>
      </section>

      <button onClick={cari} disabled={loading} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto"><Sparkles size={18} /> {loading ? 'Mencari ide...' : `Cari Ide Masakan (${profile.stok.length} Bahan)`}</button>
      {aiInfo && <div className="rounded-2xl border border-brand-mint bg-brand-light/60 p-3 text-sm"><span className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${aiInfo.sumber === 'ai' ? 'bg-brand-dark text-white' : 'bg-slate-300 text-slate-700'}`}>{aiInfo.sumber === 'ai' ? 'Saran AI' : 'Mode aturan'}</span>{aiInfo.alasan}</div>}

      <div className="flex items-end justify-between"><h2 className="text-xl font-extrabold lg:text-2xl">Ide Masakan dari Bahanmu</h2></div>
      {list.length === 0 && <div className="card text-sm text-slate-600">Belum ada resep yang cocok. Tambahkan bahan seperti telur, nasi, atau tempe.</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(({ recipe: r, persen, kurang, biaya }) => (
          <div key={r.id} className="card">
            <div className="flex gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-light text-4xl">{r.emoji}</div>
              <div className="min-w-0 flex-1">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${persen === 100 ? 'bg-brand-light text-brand-dark' : 'bg-accent-light text-amber-800'}`}>{persen === 100 ? '100% Cocok' : `${persen}% Cocok • Perlu ${kurang.length} bahan`}</span>
                <div className="font-bold leading-snug">{r.nama}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={12} /> {r.waktu} mnt • {r.alat[0] || 'Tanpa alat'}</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
              {kurang.length === 0 ? <div className="flex flex-wrap justify-between gap-1 font-bold"><span>Biaya tambahan:</span><span className="text-brand-dark">Rp 0 (Bahan Lengkap)</span></div>
                : <div className="flex flex-wrap justify-between gap-1 font-bold"><span>Kurang: {kurang.map((k) => k.nama).join(', ')}</span><span className="text-accent">~{rupiah(biaya)}</span></div>}
            </div>
            <Link href={`/menu/${r.id}`} className="btn btn-primary mt-3 w-full">Lihat Resep</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
