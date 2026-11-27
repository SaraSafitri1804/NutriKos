'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Save, Check, Heart, CalendarCheck2, Wallet, X, Plus, Camera, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import Ring from '@/components/Ring';
import { AVATARS, PANTANGAN_OPTIONS, cekKelengkapanProfil, rupiah, targetGizi } from '@/lib/data';

export default function ProfilSaya() {
  const { profile, setProfile, favorit, log, ready } = useApp();
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(false);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState('');
  const fileInputRef = useRef(null);

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

  // Handler Upload Foto Sendiri (Kompresi & Crop Persegi Otomatis)
  const handleUploadFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorFoto('');

    if (!file.type.startsWith('image/')) {
      setErrorFoto('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    setLoadingFoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 256;
          const width = img.width;
          const height = img.height;

          // Crop square tepat di tengah agar foto tidak tertarik / penyok
          const minSide = Math.min(width, height);
          const startX = (width - minSide) / 2;
          const startY = (height - minSide) / 2;

          canvas.width = MAX_DIM;
          canvas.height = MAX_DIM;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, MAX_DIM, MAX_DIM);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          ubah({ avatar: dataUrl });
          setProfile({ avatar: dataUrl });
          setLoadingFoto(false);
          setToast('✓ Foto profil berhasil dipasang!');
          setTimeout(() => setToast(false), 2500);
        } catch (err) {
          setErrorFoto('Gagal memproses gambar profil.');
          setLoadingFoto(false);
        }
      };
      img.onerror = () => {
        setErrorFoto('Gagal memuat gambar.');
        setLoadingFoto(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setErrorFoto('Gagal membaca file gambar.');
      setLoadingFoto(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hapusFoto = () => {
    const defaultAvatar = '👩‍🎓';
    ubah({ avatar: defaultAvatar });
    setProfile({ avatar: defaultAvatar });
    setToast('✓ Foto dihapus, kembali ke karakter emoji.');
    setTimeout(() => setToast(false), 2500);
  };

  const simpan = () => {
    if (!form.nama.trim()) return;
    setProfile({ nama: form.nama.trim(), kampus: form.kampus.trim(), prodi: form.prodi.trim(), semester: form.semester, avatar: form.avatar });
    setToast('✓ Perubahan berhasil disimpan');
    setTimeout(() => setToast(false), 2500);
  };
  const sisaPantangan = PANTANGAN_OPTIONS.filter((p) => !profile.pantangan.includes(p));
  const kelengkapan = cekKelengkapanProfil(form);

  const isFotoKustom = form.avatar?.startsWith('data:image') || form.avatar?.startsWith('http');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-extrabold sm:text-3xl">Profil Saya</h1><p className="text-slate-600">Kelola data pribadi dan preferensi makananmu.</p></div>
        <div className="flex items-center gap-3">
          <button onClick={simpan} className="btn btn-primary rounded-full"><Save size={16} /> Simpan Perubahan</button>
        </div>
      </div>

      {kelengkapan.kosongDataDiri.length > 0 && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <div className="font-extrabold">Data diri kamu belum lengkap</div>
            <p className="mt-0.5 text-xs text-amber-800">
              Silakan lengkapi kolom yang masih kosong ({kelengkapan.kosongDataDiri.map((d) => d.label).join(', ')}), lalu klik <b>Simpan Perubahan</b>.
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm font-bold text-success-dark animate-in fade-in duration-200">
          <Check size={18} /> {typeof toast === 'string' ? toast : 'Perubahan berhasil disimpan'}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Kolom kiri: identitas */}
        <div className="space-y-6">
          <section className="card p-6 text-center">
            {/* Foto / Avatar Profil */}
            <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-brand-light ring-4 ring-brand-mint shadow-md transition-all hover:ring-brand-dark"
                title="Klik untuk mengubah foto profil"
              >
                {isFotoKustom ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatar} alt="Foto Profil" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl sm:text-7xl">{form.avatar}</span>
                )}

                {/* Overlay hover kamera */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={24} />
                  <span className="mt-1 text-[11px] font-bold">Ubah Foto</span>
                </div>
              </div>

              {/* Tombol Kamera di sudut avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-white shadow-md hover:bg-brand-deeper transition-transform hover:scale-105"
                title="Pilih foto dari galeri / kamera"
                aria-label="Pilih foto profil"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadFoto}
              className="hidden"
            />

            {/* Tombol Aksi Upload / Hapus */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingFoto}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand-mint/60 transition-colors cursor-pointer"
              >
                <Upload size={13} /> {loadingFoto ? 'Memproses...' : 'Pilih Foto'}
              </button>

              {isFotoKustom && (
                <button
                  type="button"
                  onClick={hapusFoto}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Hapus foto dan kembali ke karakter emoji"
                >
                  <Trash2 size={13} /> Hapus Foto
                </button>
              )}
            </div>

            {errorFoto && <p className="mt-2 text-xs font-medium text-red-500">{errorFoto}</p>}

            <div className="mt-4 text-xl font-extrabold">{form.nama || 'Nama kamu'}</div>
            <span className="mt-1 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">Mahasiswa Semester {form.semester}</span>
            <div className="mt-1 text-xs text-slate-500">{form.email || 'Email belum diisi'}</div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="label">Atau pilih karakter kos</div>
              <div className="flex flex-wrap justify-center gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-label={`Avatar ${a}`}
                    onClick={() => {
                      ubah({ avatar: a });
                      setProfile({ avatar: a });
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-transform hover:scale-110 cursor-pointer ${
                      form.avatar === a ? 'bg-brand-mint ring-2 ring-brand-dark' : 'bg-slate-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
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
              <div>
                <label className="label flex items-center gap-2" htmlFor="kampus">
                  <span>Asal kampus</span>
                  {!form.kampus?.trim() && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold normal-case text-amber-800">Belum diisi</span>}
                </label>
                <input id="kampus" className="input" placeholder="contoh: Universitas Indonesia" value={form.kampus} onChange={(e) => ubah({ kampus: e.target.value })} />
              </div>
              <div>
                <label className="label flex items-center gap-2" htmlFor="prodi">
                  <span>Program studi</span>
                  {!form.prodi?.trim() && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold normal-case text-amber-800">Belum diisi</span>}
                </label>
                <input id="prodi" className="input" placeholder="contoh: Teknik Informatika" value={form.prodi} onChange={(e) => ubah({ prodi: e.target.value })} />
              </div>
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
