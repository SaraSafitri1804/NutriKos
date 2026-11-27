'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Refrigerator, Dices, ChevronRight, Clock, ShoppingBag, Store, Eye, Leaf } from 'lucide-react';
import { useApp, kunciTanggal } from '@/components/AppProvider';
import { getRecipe, rupiah, targetGizi, SLOT_LABEL } from '@/lib/data';
import { nutrisiDari, allowedRecipes, ideasFromStock } from '@/lib/recommend';
import { mintaAI } from '@/lib/ai';
import Ring from '@/components/Ring';

const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const JAM_SLOT = { pagi: 7.5, siang: 12.5, malam: 19 };
const LABEL_JAM = { pagi: '07:30', siang: '12:30', malam: '19:00' };
const URUT = { pagi: 0, siang: 1, malam: 2 };

export default function Beranda() {
  const router = useRouter();
  const { profile, plan, log, setPlan, generatePlan, setAi, customPlanDetails, setTriggerAiModal, getShoppingItems, checked, favorit, ready } = useApp();
  const [loading, setLoading] = useState(false);
  const [jamSekarang, setJamSekarang] = useState(null);
  useEffect(() => {
    const t = () => { const d = new Date(); setJamSekarang(d.getHours() + d.getMinutes() / 60); };
    t();
    const id = setInterval(t, 60000);
    return () => clearInterval(id);
  }, []);
  if (!ready) return null;

  const T = targetGizi(profile);
  const resep = plan.map(getRecipe).filter(Boolean).sort((a, b) => URUT[a.slot] - URUT[b.slot]);
  const n = nutrisiDari(plan, customPlanDetails);
  // Hanya hitung biaya hari ini jika user sudah benar-benar mencatat makan (log[kunciHariIni] ada)
  const sudahLog = !!(log?.[kunciTanggal(new Date())] );
  const biayaHariIni = sudahLog ? n.biaya : 0;
  const sisa = profile.budget - biayaHariIni;
  const pct = (v, t) => Math.round((v / t) * 100);
  const skor = Math.round(((Math.min(1, n.protein / T.protein) + Math.min(1, n.serat / T.serat) + Math.min(1, n.karbo / T.karbo)) / 3) * 100);
  const statusGizi = skor >= 80 ? 'Cukup' : skor >= 50 ? 'Perlu Ditingkatkan' : 'Kurang';
  const nama = profile.nama.split(' ')[0];

  // Pengeluaran minggu ini (Senin-Minggu): hari lampau dari riwayat 'log', hari ini hanya jika sudah log
  const sekarang = new Date();
  const idxHariIni = (sekarang.getDay() + 6) % 7;
  const kunciHariIni = kunciTanggal(sekarang);
  const minggu = HARI_PENDEK.map((label, i) => {
    const d = new Date(sekarang.getTime() + (i - idxHariIni) * 86400000);
    const k = kunciTanggal(d);
    const ids = log?.[k] || [];
    // Hari ini: tampilkan biaya hanya kalau user sudah log (sudahLog); hari lain: dari riwayat log
    const biaya = (k === kunciHariIni)
      ? (sudahLog ? biayaHariIni : 0)
      : ids.reduce((s, id) => s + (getRecipe(id)?.harga || 0), 0);
    return { label, biaya, hariIni: i === idxHariIni, ada: ids.length > 0 };
  });
  const totalMinggu = minggu.reduce((s, h) => s + h.biaya, 0);
  const hariAda = minggu.filter((h) => h.ada).length;
  const hemat = hariAda && totalMinggu <= profile.budget * hariAda ? Math.round((1 - totalMinggu / (profile.budget * hariAda)) * 100) : 0;
  const maks = Math.max(profile.budget, ...minggu.map((h) => h.biaya));

  // Jadwal menu: menu berikutnya disorot
  const idxBerikut = jamSekarang == null ? -1 : resep.findIndex((r) => JAM_SLOT[r.slot] + 1 > jamSekarang);

  // Belanja & ide dari bahan
  const belanja = (getShoppingItems ? getShoppingItems() : []).filter((x) => !x.sudahAda && !checked[x.nama]);
  const biayaBelanja = belanja.reduce((s, x) => s + (x.harga || 0), 0);
  const ide = ideasFromStock(profile).slice(0, 2);
  const resepFavorit = (favorit || []).map(getRecipe).filter(Boolean).slice(0, 2);

  const rekomendasi = async () => {
    setLoading(true);
    const hasil = await mintaAI('menu', profile);
    if (hasil && hasil.ids?.length) { setPlan(hasil.ids); setAi({ alasan: hasil.alasan, sumber: hasil.sumber }); }
    else { generatePlan(); setAi({ alasan: 'Dipilih berdasarkan bujet, alat masak, dan pantanganmu (mode aturan).', sumber: 'aturan' }); }
    setLoading(false);
    setTriggerAiModal?.(true);
    router.push('/menu');
  };
  const acak = () => {
    const list = allowedRecipes(profile);
    if (list.length) router.push(`/menu/${list[Math.floor(Math.random() * list.length)].id}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3 w-full min-w-0 max-w-full">
      <div className="space-y-4 sm:space-y-6 xl:col-span-2 min-w-0 max-w-full">
        {/* Sapaan */}
        <section className="card relative overflow-hidden p-4 sm:p-8">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark">
                <Leaf size={13} /> Skor gizi hari ini {skor}%
              </span>
              <h1 className="mt-2.5 text-2xl font-extrabold sm:text-3xl">Halo, {nama}!</h1>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                {sudahLog
                  ? <>Sisa anggaran makan hari ini <b>{rupiah(sisa)}</b>. Kamu punya {resep.length} menu terjadwal. Yuk masak hemat &amp; bernutrisi!</>
                  : <>Anggaran makan hari ini <b>{rupiah(profile.budget)}</b>. Yuk pilih menu dan mulai catat makanmu!</>
                }
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button className="btn btn-primary w-full sm:w-auto disabled:opacity-70" disabled={loading} onClick={rekomendasi}><Sparkles size={18} /> {loading ? 'Menyusun menu...' : 'Rekomendasikan Menu'}</button>
                <Link href="/bahan-sisa" className="btn btn-soft w-full sm:w-auto text-center"><Refrigerator size={18} /> Cek Bahan Sisa</Link>
              </div>
            </div>
            <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-3xl bg-brand-light text-7xl sm:flex">🍳</div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 min-w-0 max-w-full">
          {/* Pengeluaran */}
          <section className="card space-y-3 sm:space-y-4 p-3.5 sm:p-5 min-w-0 max-w-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Pengeluaran</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-slate-600 shrink-0">Minggu ini</span>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total pengeluaran:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{rupiah(totalMinggu)}</div>
              <div className="text-xs text-slate-500">dari target {rupiah(profile.budget * 7)}</div>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-2 sm:p-3 overflow-hidden">
              <div className="flex h-36 items-end gap-1 sm:gap-2">
                {minggu.map((h) => (
                  <div key={h.label} className="flex flex-1 min-w-0 flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500 truncate">{h.biaya ? Math.round(h.biaya / 1000) + 'k' : ''}</span>
                    <div className="flex h-24 w-full flex-col justify-end overflow-hidden rounded-md bg-brand-light" title={rupiah(h.biaya)}>
                      <div className="w-full bg-brand-dark" style={{ height: `${(h.biaya / maks) * 100}%` }} />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] truncate ${h.hariIni ? 'font-extrabold text-brand-dark' : 'text-slate-500'}`}>{h.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 sm:gap-3 text-slate-600">
                  <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-dark" /> Terpakai</span>
                  <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-light ring-1 ring-brand-mint" /> Sisa kuota</span>
                </span>
                {hemat > 0 && <span className="font-bold text-success-dark">Hemat {hemat}%</span>}
              </div>
            </div>
          </section>

          {/* Ringkasan gizi */}
          <section className="card flex flex-col p-3.5 sm:p-5 min-w-0 max-w-full">
            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Ringkasan Gizi</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-slate-600 shrink-0">Hari ini</span>
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <Ring persen={pct(n.kalori, T.kalori)} label="Kalori" detail={`${n.kalori} / ${T.kalori} kkal`} />
              <Ring persen={pct(n.protein, T.protein)} label="Protein" detail={`${n.protein}g / ${T.protein}g`} />
              <Ring persen={pct(n.karbo, T.karbo)} label="Karbohidrat" detail={`${n.karbo}g / ${T.karbo}g`} />
              <Ring persen={pct(n.serat, T.serat)} label="Serat" detail={`${n.serat}g / ${T.serat}g`} />
            </div>
            <Link href="/gizi" className={`mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${skor >= 80 ? 'bg-success-light text-success-dark' : 'bg-accent-light text-amber-800'}`}>
              Status Gizi: {statusGizi} <ChevronRight size={14} className="ml-auto" />
            </Link>
          </section>
        </div>

        {/* Menu favorit */}
        {resepFavorit.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Menu Favorit</h2><Link href="/menu" className="text-xs font-bold text-brand-dark underline">Lihat semua</Link></div>
            {resepFavorit.map((r) => (
              <div key={r.id} className="card flex items-center gap-3 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-light text-3xl">{r.emoji}</div>
                <div className="min-w-0 flex-1"><div className="truncate font-bold">{r.nama}</div><div className="text-xs text-slate-500">{rupiah(r.harga)} · {r.kalori} kkal</div></div>
                <Link href={`/menu/${r.id}`} aria-label={`Lihat ${r.nama}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand-dark"><Eye size={17} /></Link>
              </div>
            ))}
          </section>
        )}

        {/* Ide dari bahan */}
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Ide dari Bahan di Kos</h2><Link href="/bahan-sisa" className="text-xs font-bold text-brand-dark underline">Lihat semua</Link></div>
          {ide.length === 0 && <div className="card text-sm text-slate-600">Tambahkan bahan di halaman Cek Bahan Sisa untuk mendapat ide masakan.</div>}
          {ide.map(({ recipe: r, persen }) => (
            <div key={r.id} className="card flex items-center gap-3 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-light text-3xl">{r.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{r.nama}</div>
                <div className="text-xs text-slate-500">{rupiah(r.harga)} · {r.kalori} kkal · bahan {persen}% tersedia</div>
              </div>
              <Link href={`/menu/${r.id}`} aria-label={`Lihat ${r.nama}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand-dark"><Eye size={17} /></Link>
            </div>
          ))}
          <button onClick={acak} className="btn btn-soft w-full"><Dices size={18} /> Ide Masak Acak</button>
        </section>
      </div>

      {/* Kolom kanan */}
      <div className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
        <section className="card p-3.5 sm:p-5 min-w-0 max-w-full">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div><h2 className="text-base sm:text-lg font-extrabold text-slate-800">Jadwal Menu</h2><p className="text-xs text-slate-500">{resep.length} jadwal hari ini</p></div>
            <Link href="/menu" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Ubah</Link>
          </div>
          {resep.length === 0 && <p className="text-sm text-slate-600">Belum ada menu. Tekan "Rekomendasikan Menu".</p>}
          <ul className="space-y-2.5 sm:space-y-3">
            {resep.map((r, i) => {
              const aktif = i === idxBerikut;
              const lewat = idxBerikut === -1 ? jamSekarang != null : i < idxBerikut;
              return (
                <li key={r.id} className="flex items-center gap-2 sm:gap-3">
                  <span className={`w-10 sm:w-11 shrink-0 text-xs font-bold ${aktif ? 'text-brand-dark' : 'text-slate-500'}`}>{LABEL_JAM[r.slot]}</span>
                  <Link href={`/menu/${r.id}`} className={`flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 rounded-2xl p-3 transition-colors ${aktif ? 'bg-brand-dark text-white shadow-md' : lewat ? 'bg-slate-50 text-slate-400 hover:bg-slate-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <span className="text-2xl shrink-0">{r.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{SLOT_LABEL[r.slot]}: {r.nama}</span>
                      <span className={`block truncate text-xs ${aktif ? 'text-white/80' : 'text-slate-500'}`}><Clock size={11} className="inline mr-1" />{r.waktu} mnt · {r.kalori} kkal · {rupiah(r.harga)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Agenda Belanja</h2><Link href="/belanja" className="text-xs font-bold text-brand-dark underline">Lihat semua</Link></div>
          <Link href="/belanja" className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand-dark"><ShoppingBag size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">Belanja untuk menu hari ini</span><span className="text-xs text-slate-500">{belanja.length} item perlu dibeli · {rupiah(biayaBelanja)}</span></span>
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
          <Link href="/bahan-sisa" className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-light text-success-dark"><Store size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">Bahan tersimpan di kos</span><span className="text-xs text-slate-500">{profile.stok.length} bahan · {profile.alat.length} alat masak</span></span>
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
        </section>
      </div>
    </div>
  );
}
