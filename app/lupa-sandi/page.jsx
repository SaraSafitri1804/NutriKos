'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { AuthCard, Field, Pesan, kelasInput } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';
import { terjemahError } from '@/lib/auth-utils';

export default function LupaSandi() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [terkirim, setTerkirim] = useState(false);

  const kirim = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Format email tidak valid.');
    setLoading(true);
    try {
      const { error: err } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-sandi` });
      // Pesan sukses sengaja sama untuk email terdaftar maupun tidak, agar tidak membocorkan siapa yang punya akun.
      if (err && !/not found|no user/i.test(err.message)) { setError(terjemahError(err.message)); setLoading(false); return; }
      setTerkirim(true);
    } catch (ex) {
      setError(terjemahError(ex.message));
    }
    setLoading(false);
  };

  return (
    <AuthCard badge="Pemulihan Akun Mahasiswa" judul="Lupa Kata Sandi?" deskripsi="Masukkan email yang terdaftar di NutriKos. Kami akan mengirim tautan untuk membuat kata sandi baru." lebar="max-w-lg">
      {terkirim ? (
        <div className="space-y-4">
          <Pesan jenis="ok">Jika email tersebut terdaftar, tautan reset kata sandi sudah dikirim. Cek kotak masuk dan folder Spam.</Pesan>
          <Link href="/login" className="btn btn-primary w-full rounded-full py-3.5">Kembali ke Halaman Masuk</Link>
        </div>
      ) : (
        <form onSubmit={kirim} className="space-y-4" noValidate>
          <Field id="email" label="Email Terdaftar" Icon={Mail}>
            <input id="email" type="email" autoComplete="email" placeholder="contoh: nama@campus.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} className={kelasInput} />
          </Field>
          <Pesan>{error}</Pesan>
          <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-full py-3.5 text-base shadow-md disabled:opacity-70">
            {loading ? 'Mengirim...' : <>Kirim Instruksi Reset <ArrowRight size={18} /></>}
          </button>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-amber-700"><Lightbulb size={16} /></span>
            <div><b className="text-slate-800">Tips:</b> periksa folder Spam atau Promosi bila email belum masuk dalam 1–2 menit. Tautan hanya berlaku sementara.</div>
          </div>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500"><Link href="/login" className="inline-flex items-center gap-1 font-bold text-brand-dark hover:underline"><ArrowLeft size={14} /> Sudah ingat kata sandi? Masuk</Link></p>
    </AuthCard>
  );
}
