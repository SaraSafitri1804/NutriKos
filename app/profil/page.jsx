'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Save, Check, Heart, CalendarCheck2, Wallet, X, Plus } from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import Ring from '@/components/Ring';
import { AVATARS, PANTANGAN_OPTIONS, rupiah, targetGizi } from '@/lib/data';

export default function ProfilSaya() {
  const router = useRouter();
  const { profile, setProfile, favorit, log, reset, ready } = useApp();
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(false);

  // Isi form setelah data akun selesai dimuat dari database (atau setelah 2,5 detik bila tanpa koneksi),
  // agar menyimpan tidak menimpa data akun dengan data lokal yang lama.
  const [lewat, setLewat] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLewat(true), 2500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (ready && (profile.akunId || lewat) && (!form || (profile.akunId && form.akunId !== profile.akunId))) setForm(profile);
  }, [ready, lewat, profile, form]);
  if (!ready || !form) return <div className="card text-sm text-slate-500">Memuat data akun...</div>;

  const T = targetGizi(profile);
  const hariTercatat = Object.keys(log || {}).length;
  const ubah = (patch) => setForm((f) => ({ ...f, ...patch }));
  const simpan = () => {
    if (!form.nama.trim()) return;
    setProfile({ nama: form.nama.trim(), kampus: form.kampus.trim(), prodi: form.prodi.trim(), semester: form.semester, avatar: form.avatar });
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };
  const resetData = () => { if (confirm('Reset catatan belanja di perangkat ini? Profil, menu, favorit, dan riwayat akunmu tetap tersimpan.')) { reset(); router.push('/'); } };
  const sisaPantangan = PANTANGAN_OPTIONS.filter((p) => !profile.pantangan.includes(p));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-extrabold sm:text-3xl">Profil Saya</h1><p className="text-slate-600">Kelola data pribadi dan preferensi makananmu.</p></div>
        <div className="flex items-center gap-3">
          <button onClick={resetData} className="text-sm font-semibold text-red-600">Reset Data</button>
          <button onClick={simpan} className="btn btn-primary rounded-full"><Save size={16} /> Simpan Perubahan</button>
        </div>
      </div>

      {toast && <div role="status" className="flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm font-bold text-success-dark"><Check size={18} /> Perubahan berhasil disimpan</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Kolom kiri: identitas */}
        <div className="space-y-6">
          <section className="card p-6 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand-light text-6xl ring-4 ring-brand-mint">{form.avatar}</div>
            <div className="mt-4 text-xl font-extrabold">{form.nama || 'Nama kamu'}</div>
            <span className="mt-1 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">Mahasiswa Semester {form.semester}</span>
            <div className="mt-1 text-xs text-slate-500">{form.email || 'Email belum diisi'}</div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="label">Pilih karakter kos</div>
              <div className="flex flex-wrap justify-center gap-2">
                {AVATARS.map((a) => <button key={a} aria-label={`Avatar ${a}`} onClick={() => ubah({ avatar: a })} className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-transform hover:scale-110 ${form.avatar === a ? 'bg-brand-mint ring-2 ring-brand-dark' : 'bg-slate-100'}`}>{a}</button>)}
              </div>
            </div>
          </section>

          <section className="card space-y-3 p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Aktivitas di NutriKos</h2>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><Heart size={18} /></span><div><div className="text-xs text-slate-500">Menu favorit</div><div className="font-extrabold">{favorit.length} resep</div></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark"><CalendarCheck2 size={18} /></span><div><div className="text-xs text-slate-500">Hari tercatat</div><div className="font-extrabold">{hariTercatat} hari</div></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-amber-700"><Wallet size={18} /></span><div><div className="text-xs text-slate-500">Bujet harian</div><div className="font-extrabold">{rupiah(profile.budget)}</div></div></div>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6 xl:col-span-2">
          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-extrabold">Data Diri Mahasiswa</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="label" htmlFor="nama">Nama lengkap</label><input id="nama" className="input" value={form.nama} onChange={(e) => ubah({ nama: e.target.value })} /></div>
              <div><label className="label" htmlFor="email">Email akun (untuk login)</label><input id="email" type="email" className="input bg-slate-100 text-slate-500" value={form.email} readOnly aria-readonly="true" /></div>
              <div><label className="label" htmlFor="kampus">Asal kampus</label><input id="kampus" className="input" value={form.kampus} onChange={(e) => ubah({ kampus: e.target.value })} /></div>
              <div><label className="label" htmlFor="prodi">Program studi</label><input id="prodi" className="input" value={form.prodi} onChange={(e) => ubah({ prodi: e.target.value })} /></div>
              <div><label className="label" htmlFor="smt">Semester saat ini</label>
                <select id="smt" className="input" value={form.semester} onChange={(e) => ubah({ semester: e.target.value })}>{[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}</select></div>
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-lg font-extrabold">Target Nutrisi & Kalori Harian</h2><p className="text-xs text-slate-500">Berpedoman pada AKG 2019 ({profile.jenisKelamin}, usia 19–29 tahun).</p></div>
              <Link href="/profil-kos" className="shrink-0 text-xs font-bold text-brand-dark underline">Ubah jenis kelamin</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[['Energi', T.kalori, 'kkal'], ['Protein', T.protein, 'g'], ['Karbohidrat', T.karbo, 'g'], ['Serat', T.serat, 'g']].map(([l, v, u]) => (
                <div key={l} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">{l}</div><div className="text-2xl font-extrabold">{v.toLocaleString('id-ID')}</div><div className="text-xs text-slate-500">{u} / hari</div></div>
              ))}
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <div><h2 className="text-lg font-extrabold">Alergi & Pantangan</h2><p className="text-xs text-slate-500">Dipakai untuk menyaring rekomendasi menu. Klik × untuk menghapus.</p></div>
            <div className="flex flex-wrap gap-2">
              {profile.pantangan.length === 0 && <span className="text-sm text-slate-500">Belum ada pantangan.</span>}
              {profile.pantangan.map((p) => (
                <span key={p} className="chip bg-red-50 text-red-700">{p}<button aria-label={`Hapus ${p}`} onClick={() => setProfile({ pantangan: profile.pantangan.filter((x) => x !== p) })}><X size={14} /></button></span>
              ))}
            </div>
            {sisaPantangan.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">Tambah:</span>
                {sisaPantangan.map((p) => <button key={p} onClick={() => setProfile({ pantangan: [...profile.pantangan, p] })} className="chip !py-1 text-xs"><Plus size={12} />{p}</button>)}
              </div>
            )}
          </section>

          <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
            <div><h2 className="flex items-center gap-2 text-lg font-extrabold">Profil Kos & Dapur <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-bold text-success-dark">Aktif</span></h2><p className="text-sm text-slate-600">{rupiah(profile.budget)} / hari · {profile.alat.join(', ') || 'tanpa alat masak'} · {profile.lokasi}</p></div>
            <Link href="/profil-kos" className="btn btn-soft">Ubah Profil Kos</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
