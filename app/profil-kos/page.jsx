'use client';
import { useState } from 'react';
import { Check, Plus, RotateCcw, Save, Home, Wallet, CookingPot, Flame, Microwave, Wind, Soup, ChefHat, Utensils, MapPin, ShieldAlert } from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import { ALAT_OPTIONS, PANTANGAN_OPTIONS, DEFAULT_PROFILE, rupiah, targetGizi, RECIPES } from '@/lib/data';
import { allowedRecipes } from '@/lib/recommend';

const PILIHAN_CEPAT = [{ l: 'Hemat', v: 20000 }, { l: 'Standar', v: 30000 }, { l: 'Leluasa', v: 50000 }];
const JENIS_KELAMIN = ['Perempuan', 'Laki-laki'];
const ALAT_INFO = {
  'Rice Cooker': { Icon: CookingPot, ket: 'Bisa untuk menanak nasi, merebus, dan masak satu panci.' },
  Kompor: { Icon: Flame, ket: 'Kompor gas atau listrik mini untuk menumis dan merebus.' },
  Microwave: { Icon: Microwave, ket: 'Menghangatkan dan memasak menu praktis.' },
  'Air Fryer': { Icon: Wind, ket: 'Menggoreng dengan sedikit minyak.' },
  'Panci / Wajan Listrik': { Icon: Soup, ket: 'Peralatan pribadi untuk menumis dan merebus di kamar.' },
};

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function ProfilKos() {
  const { profile, setProfile, generatePlan, ready } = useApp();
  const [toast, setToast] = useState('');
  if (!ready) return null;

  const cocok = allowedRecipes(profile).length;
  const T = targetGizi(profile);
  const simpan = () => {
    generatePlan();
    setToast('Pengaturan kos tersimpan dan menu diperbarui.');
    setTimeout(() => setToast(''), 3000);
  };
  const reset = () => {
    if (!confirm('Kembalikan pengaturan kos ke bawaan?')) return;
    setProfile({ budget: DEFAULT_PROFILE.budget, alat: DEFAULT_PROFILE.alat, pantangan: DEFAULT_PROFILE.pantangan, lokasi: DEFAULT_PROFILE.lokasi, jenisKelamin: DEFAULT_PROFILE.jenisKelamin });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Profil Kos</h1>
          <p className="max-w-xl text-slate-600">Atur kondisi kos, alat masak, dan bujet harian agar rekomendasi menu lebih akurat.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn rounded-full bg-white shadow-sm"><RotateCcw size={16} /> Reset Pengaturan</button>
          <button onClick={simpan} className="btn btn-primary rounded-full"><Save size={16} /> Simpan Perubahan</button>
        </div>
      </div>

      {toast && <div role="status" className="flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm font-bold text-success-dark"><Check size={18} /> {toast}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Informasi kos */}
          <section className="card space-y-5 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand-dark"><Home size={20} /></span>
              <div><h2 className="text-lg font-extrabold">Informasi Kos</h2><p className="text-xs text-slate-500">Data dasar untuk menyesuaikan menu dan target gizi.</p></div>
            </div>
            <div>
              <label className="label" htmlFor="lokasi">Lokasi / area kos</label>
              <div className="relative"><MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="lokasi" className="input !pl-9" value={profile.lokasi} onChange={(e) => setProfile({ lokasi: e.target.value })} /></div>
            </div>
            <div>
              <div className="label">Jenis kelamin <span className="font-medium normal-case text-slate-400">(dipakai menghitung target AKG)</span></div>
              <div className="grid grid-cols-2 gap-3">
                {JENIS_KELAMIN.map((j) => (
                  <button key={j} onClick={() => setProfile({ jenisKelamin: j })} aria-pressed={profile.jenisKelamin === j} className={`rounded-2xl px-4 py-3 text-left transition-colors ${profile.jenisKelamin === j ? 'bg-brand-dark text-white' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="font-bold">{j}</div>
                    <div className={`text-xs ${profile.jenisKelamin === j ? 'text-white/80' : 'text-slate-500'}`}>Target {targetGizi({ jenisKelamin: j }).kalori.toLocaleString('id-ID')} kkal / hari</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Peralatan */}
          <section className="card space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-light text-success-dark"><ChefHat size={20} /></span>
              <div className="flex-1"><h2 className="text-lg font-extrabold">Peralatan Memasak yang Tersedia</h2><p className="text-xs text-slate-500">NutriKos hanya merekomendasikan resep yang cocok dengan alatmu.</p></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{profile.alat.length} dari {ALAT_OPTIONS.length} alat aktif</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ALAT_OPTIONS.map((a) => {
                const on = profile.alat.includes(a);
                const { Icon, ket } = ALAT_INFO[a] || { Icon: Utensils, ket: '' };
                return (
                  <button key={a} onClick={() => setProfile({ alat: toggle(profile.alat, a) })} aria-pressed={on} className={`relative rounded-2xl border-2 p-4 text-left transition-colors ${on ? 'border-brand-dark bg-brand-light' : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    <span className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full ${on ? 'bg-brand-dark text-white' : 'bg-slate-200 text-slate-500'}`}>{on ? <Check size={14} /> : <Plus size={14} />}</span>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${on ? 'text-brand-dark' : 'text-slate-400'}`}><Icon size={20} /></span>
                    <div className={`mt-2 font-bold ${on ? 'text-slate-900' : ''}`}>{a}</div>
                    <div className="text-xs">{ket}</div>
                    <div className={`mt-2 text-[11px] font-bold ${on ? 'text-brand-dark' : ''}`}>{on ? '✓ TERSEDIA' : 'Klik untuk aktifkan'}</div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setProfile({ alat: [] })} className={`w-full rounded-xl px-3 py-3 text-sm font-bold transition-colors ${profile.alat.length === 0 ? 'bg-brand-dark text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Tidak ada alat (hanya beli matang / warteg)</button>
          </section>

          {/* Pantangan */}
          <section className="card space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><ShieldAlert size={20} /></span>
              <div><h2 className="text-lg font-extrabold">Alergi & Pantangan</h2><p className="text-xs text-slate-500">Resep yang mengandung pantanganmu tidak akan direkomendasikan.</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PANTANGAN_OPTIONS.map((p) => {
                const on = profile.pantangan.includes(p);
                return <button key={p} onClick={() => setProfile({ pantangan: toggle(profile.pantangan, p) })} aria-pressed={on} className={`chip transition-colors ${on ? 'bg-brand-dark text-white' : 'hover:bg-slate-200'}`}>{on && <Check size={14} />}{p}</button>;
              })}
            </div>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light text-amber-700"><Wallet size={20} /></span>
              <h2 className="text-lg font-extrabold">Target Anggaran Makan</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Bujet harian</div>
              <div className="text-4xl font-extrabold">{rupiah(profile.budget)} <span className="text-sm font-medium text-slate-500">/ hari</span></div>
              <div className="mt-1 text-xs text-slate-500">≈ {rupiah(profile.budget / 3)} per makan · {rupiah(profile.budget * 7)} per minggu</div>
              <input type="range" min={10000} max={100000} step={1000} value={profile.budget} onChange={(e) => setProfile({ budget: Number(e.target.value) })} className="mt-4 w-full accent-brand-dark" aria-label="Bujet harian" />
              <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>Rp 10.000</span><span>Rp 100.000</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PILIHAN_CEPAT.map((p) => <button key={p.l} onClick={() => setProfile({ budget: p.v })} className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${profile.budget === p.v ? 'bg-brand-dark text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{p.l}<div className="text-[11px] font-medium opacity-80">{rupiah(p.v)}</div></button>)}
            </div>
          </section>

          <section className="card space-y-3 p-6">
            <h2 className="text-lg font-extrabold">Dampak Profil pada Rekomendasi</h2>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold">{cocok} dari {RECIPES.length} resep cocok</div><div className="text-xs text-slate-500">Berdasarkan {profile.alat.length} alat masak dan {profile.pantangan.length} pantangan aktif.</div></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold">Target {T.kalori.toLocaleString('id-ID')} kkal / hari</div><div className="text-xs text-slate-500">Protein {T.protein}g · Karbo {T.karbo}g · Serat {T.serat}g (AKG 2019, {profile.jenisKelamin}).</div></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold">{rupiah(profile.budget / 3)} per makan</div><div className="text-xs text-slate-500">Batas harga per menu yang dipakai sebagai acuan.</div></div>
          </section>

          <button onClick={simpan} className="btn btn-primary w-full rounded-full py-4"><Save size={18} /> Simpan Pengaturan Kos</button>
          <p className="text-center text-xs text-slate-500">Perubahan akan memperbarui rekomendasi menu dan estimasi belanja.</p>
        </div>
      </div>
    </div>
  );
}
