'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, Mail, Building2, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthCard, Field, InputSandi, Pesan, kelasInput } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';
import { terjemahError, kekuatanSandi, SANDI_MIN } from '@/lib/auth-utils';

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ nama: '', email: '', kampus: '', sandi: '', ulang: '', setuju: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cekEmail, setCekEmail] = useState(false);
  const ubah = (patch) => setF((x) => ({ ...x, ...patch }));
  const kuat = kekuatanSandi(f.sandi);

  const daftar = async (e) => {
    e.preventDefault();
    setError('');
    if (!f.nama.trim()) return setError('Nama lengkap wajib diisi.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Format email tidak valid.');
    if (f.sandi.length < SANDI_MIN) return setError(`Kata sandi minimal ${SANDI_MIN} karakter.`);
    if (f.sandi !== f.ulang) return setError('Konfirmasi kata sandi tidak sama.');
    if (!f.setuju) return setError('Centang persetujuan penggunaan untuk melanjutkan.');
    setLoading(true);
    try {
      const { data, error: err } = await supabaseBrowser().auth.signUp({
        email: f.email.trim(),
        password: f.sandi,
        options: { data: { nama: f.nama.trim(), kampus: f.kampus.trim() } },
      });
      if (err) { setError(terjemahError(err.message)); setLoading(false); return; }
      // Email yang sudah terdaftar (konfirmasi email aktif) mengembalikan user tanpa identitas.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('Email ini sudah terdaftar. Silakan masuk.');
        setLoading(false);
        return;
      }
      if (data.session) { router.push('/'); router.refresh(); }
      else { setCekEmail(true); setLoading(false); }
    } catch (ex) {
      setError(terjemahError(ex.message));
      setLoading(false);
    }
  };

  if (cekEmail) {
    return (
      <AuthCard badge="Hampir selesai" judul="Cek Email Kamu" deskripsi={`Kami mengirim tautan konfirmasi ke ${f.email}. Klik tautan itu, lalu masuk ke NutriKos.`}>
        <Link href="/login" className="btn btn-primary w-full rounded-full py-3.5">Ke Halaman Masuk</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard badge="Akun Baru Mahasiswa" judul="Daftar Akun NutriKos" deskripsi="Mulai atur pola makan sehat, hemat, dan praktis sesuai fasilitas kosmu.">
      <form onSubmit={daftar} className="space-y-4" noValidate>
        <Field id="nama" label="Nama Lengkap" Icon={User}>
          <input id="nama" autoComplete="name" placeholder="Nama lengkap kamu" value={f.nama} onChange={(e) => ubah({ nama: e.target.value })} className={kelasInput} />
        </Field>
        <Field id="email" label="Email Mahasiswa / Aktif" Icon={Mail}>
          <input id="email" type="email" autoComplete="email" placeholder="nama@campus.ac.id" value={f.email} onChange={(e) => ubah({ email: e.target.value })} className={kelasInput} />
        </Field>
        <Field id="kampus" label="Asal Kampus / Kota Kos" Icon={Building2}>
          <input id="kampus" placeholder="contoh: UNUSIA, Bogor" value={f.kampus} onChange={(e) => ubah({ kampus: e.target.value })} className={kelasInput} />
        </Field>
        <div>
          <Field id="sandi" label="Kata Sandi">
            <InputSandi id="sandi" Icon={Lock} autoComplete="new-password" placeholder={`Minimal ${SANDI_MIN} karakter`} value={f.sandi} onChange={(e) => ubah({ sandi: e.target.value })} />
          </Field>
          <div className="mt-2 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${kuat.skor >= i ? (kuat.skor === 3 ? 'bg-success' : kuat.skor === 2 ? 'bg-brand-dark' : 'bg-accent') : 'bg-slate-200'}`} />)}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-slate-500"><span>Kekuatan kata sandi</span><span>{kuat.label}</span></div>
        </div>
        <Field id="ulang" label="Konfirmasi Kata Sandi">
          <InputSandi id="ulang" Icon={ShieldCheck} autoComplete="new-password" placeholder="Ulangi kata sandi" value={f.ulang} onChange={(e) => ubah({ ulang: e.target.value })} />
        </Field>
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={f.setuju} onChange={(e) => ubah({ setuju: e.target.checked })} className="mt-0.5 h-4 w-4 accent-brand-dark" />
          <span>Saya menyetujui bahwa data akun dipakai untuk menyusun rekomendasi menu di NutriKos. Rekomendasi gizi bersifat panduan umum, bukan pengganti saran ahli gizi.</span>
        </label>
        <Pesan>{error}</Pesan>
        <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-full py-3.5 text-base shadow-md disabled:opacity-70">
          {loading ? 'Membuat akun...' : <>Buat Akun Gratis <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">Sudah punya akun? <Link href="/login" className="font-bold text-brand-dark hover:underline">Masuk di sini</Link></p>
    </AuthCard>
  );
}
