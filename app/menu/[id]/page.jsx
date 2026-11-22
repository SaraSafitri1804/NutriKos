'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, ShoppingCart, Check, Heart, Share2, Users, ChefHat, Wallet, ShieldCheck } from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import Ring from '@/components/Ring';
import { getRecipe, rupiah, SLOTS, SLOT_LABEL, targetGizi } from '@/lib/data';
import { adaDiStok } from '@/lib/recommend';

export default function DetailResep() {
  const { id } = useParams();
  const router = useRouter();
  const { profile, plan, setPlan, addExtra, favorit, toggleFavorit, ready } = useApp();
  const [tab, setTab] = useState('bahan');
  const [tersalin, setTersalin] = useState(false);
  const r = getRecipe(id);
  if (!ready) return null;
  if (!r) return <div className="card">Resep tidak ditemukan.</div>;

  const T = targetGizi(profile);
  const suka = favorit.includes(r.id);
  const pilih = () => {
    setPlan([...plan.filter((x) => getRecipe(x)?.slot !== r.slot), r.id].sort((a, b) => SLOTS.indexOf(getRecipe(a).slot) - SLOTS.indexOf(getRecipe(b).slot)));
    router.push('/menu');
  };
  const tambahBelanja = () => { addExtra(r.id); router.push('/belanja'); };
  const bagikan = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: r.nama, url });
      else { await navigator.clipboard.writeText(url); setTersalin(true); setTimeout(() => setTersalin(false), 2000); }
    } catch (e) {}
  };

  const dimiliki = r.bahan.filter((x) => adaDiStok(profile, x.kunci));
  const perluBeli = r.bahan.filter((x) => !adaDiStok(profile, x.kunci));
  const biayaBeli = perluBeli.reduce((s, x) => s + x.harga, 0);
  const anggaranPerMakan = Math.round(profile.budget / 3);
  const sesuai = r.harga <= anggaranPerMakan;
  const pct = (v, t) => Math.round((v / t) * 100);
  const tinggiProtein = r.protein >= 18;

  return (
    <div className="space-y-4">
      {/* Breadcrumb & aksi */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <Link href="/menu" className="hover:text-brand-dark">Rekomendasi Menu</Link><ChevronRight size={12} />
            <span>Detail Resep</span><ChevronRight size={12} />
            <b className="text-slate-800">{r.nama}</b>
          </nav>
          <button onClick={() => router.back()} className="mt-2 flex items-center gap-1 text-sm font-bold text-brand-dark"><ChevronLeft size={16} /> Kembali ke Rekomendasi</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toggleFavorit(r.id)} aria-pressed={suka} className="btn rounded-full bg-white py-2 text-xs shadow-sm"><Heart size={15} className={suka ? 'fill-red-500 text-red-500' : 'text-red-500'} /> {suka ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}</button>
          <button onClick={bagikan} className="btn rounded-full bg-white py-2 text-xs shadow-sm"><Share2 size={15} className="text-brand-dark" /> {tersalin ? 'Tautan disalin' : 'Bagikan Resep'}</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom kiri */}
        <div className="space-y-6 lg:col-span-2">
          <div className="relative flex h-56 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-light to-brand-mint/60 text-9xl sm:h-64">
            {r.emoji}
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm"><i className="h-2 w-2 rounded-full bg-accent" /> {SLOT_LABEL[r.slot]}</span>
            <span className="absolute left-36 top-4 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm sm:flex"><Clock size={12} className="text-brand-dark" /> Estimasi masak: {r.waktu} menit</span>
          </div>

          <section className="card space-y-4 p-6">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{r.nama}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2"><Clock size={15} className="text-brand-dark" /> {r.waktu} menit masak</span>
              <span className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2"><Users size={15} className="text-brand-dark" /> 1 porsi</span>
              <span className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2"><ChefHat size={15} className="text-accent" /> {r.alat.length ? `Alat: ${r.alat.join(' / ')}` : 'Tanpa alat masak'}</span>
            </div>

            {/* Tab */}
            <div className="flex gap-6 border-b border-slate-200 text-sm font-bold">
              {[['bahan', 'Daftar Bahan', r.bahan.length], ['langkah', 'Langkah Memasak', r.langkah.length]].map(([k, label, n]) => (
                <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-3 ${tab === k ? 'border-brand-dark text-brand-dark' : 'border-transparent text-slate-500'}`}>
                  {label} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{n}</span>
                </button>
              ))}
            </div>

            {tab === 'bahan' ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Status bahan dibandingkan dengan stok di kosmu (ubah di <Link href="/bahan-sisa" className="font-bold text-brand-dark underline">Cek Bahan Sisa</Link>).</p>
                {r.bahan.map((x) => {
                  const punya = adaDiStok(profile, x.kunci);
                  return (
                    <div key={x.nama} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${punya ? 'bg-success text-white' : 'border border-slate-300 bg-white'}`}>{punya && <Check size={14} />}</span>
                      <div className="min-w-0 flex-1"><div className="font-semibold">{x.nama}</div><div className="text-xs text-slate-500">{x.qty}</div></div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${punya ? 'bg-success-light text-success-dark' : 'bg-accent-light text-amber-800'}`}>{punya ? 'Tersedia di Kos' : 'Perlu Dibeli'}</span>
                      <span className="w-20 text-right text-sm font-semibold">{rupiah(x.harga)}</span>
                    </div>
                  );
                })}
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-brand-light p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark"><ShoppingCart size={18} /></span>
                  <div className="text-sm"><div className="font-bold">Total estimasi belanja baru: <span className="text-brand-dark">{rupiah(biayaBeli)}</span></div><div className="text-xs text-slate-600">{perluBeli.length} dari {r.bahan.length} bahan perlu dibeli.</div></div>
                </div>
              </div>
            ) : (
              <ol className="space-y-3">
                {r.langkah.map((l, i) => (
                  <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">{i + 1}</span><p className="pt-0.5 text-sm text-slate-700">{l}</p></li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6">
          <section className="card p-5">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div><h2 className="text-lg font-extrabold">Ringkasan Gizi</h2><p className="text-xs text-slate-500">Perhitungan untuk 1 porsi</p></div>
              <span className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">{r.kalori} kkal ({pct(r.kalori, T.kalori)}% AKG)</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
              <Ring persen={pct(r.kalori, T.kalori)} label="Energi" detail={`${r.kalori} kkal`} size="h-16 w-16" />
              <Ring persen={pct(r.protein, T.protein)} label="Protein" detail={`${r.protein} g`} size="h-16 w-16" />
              <Ring persen={pct(r.karbo, T.karbo)} label="Karbohidrat" detail={`${r.karbo} g`} size="h-16 w-16" />
              <Ring persen={pct(r.serat, T.serat)} label="Serat" detail={`${r.serat} g`} size="h-16 w-16" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Persen terhadap AKG harian ({profile.jenisKelamin || 'Perempuan'}, 19–29 tahun). Nilai gizi masih estimasi.</p>
            <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${tinggiProtein ? 'bg-success-light text-success-dark' : 'bg-slate-100 text-slate-600'}`}>
              <ShieldCheck size={16} /> {tinggiProtein ? 'Status: Tinggi protein' : 'Status: Pelengkap, padukan dengan lauk berprotein'}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Estimasi Biaya Porsi</h2><Wallet size={18} className="text-brand-dark" /></div>
            <div className="mt-3 text-4xl font-extrabold">{rupiah(r.harga)} <span className="text-sm font-medium text-slate-500">/ porsi</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${sesuai ? 'bg-success' : 'bg-accent'}`} style={{ width: `${Math.min(100, (r.harga / anggaranPerMakan) * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">Bahan di kos {rupiah(dimiliki.reduce((s, x) => s + x.harga, 0))} · perlu dibeli {rupiah(biayaBeli)}</p>
            <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${sesuai ? 'bg-success-light text-success-dark' : 'bg-accent-light text-amber-800'}`}>
              <Check size={15} /> {sesuai ? `Sesuai target anggaran (≤ ${rupiah(anggaranPerMakan)} / makan)` : `Di atas target ${rupiah(anggaranPerMakan)} / makan`}
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="text-lg font-extrabold">Rencanakan Menu</h2>
            <button onClick={pilih} className="btn btn-primary w-full rounded-full"><Check size={16} /> Pilih Menu Ini untuk {SLOT_LABEL[r.slot]}</button>
            <button onClick={tambahBelanja} className="btn btn-soft w-full rounded-full"><ShoppingCart size={16} /> Tambah Bahan ke Daftar Belanja</button>
          </section>
        </div>
      </div>
    </div>
  );
}
