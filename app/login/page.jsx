'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthCard, Field, InputSandi, Pesan, kelasInput } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';
import { terjemahError } from '@/lib/auth-utils';
import { useApp } from '@/components/AppProvider';

export default function Login() {
  const router = useRouter();
  const { reset } = useApp();
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const masuk = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !sandi) return setError('Isi email dan kata sandi.');
    setLoading(true);
    try {
      const { error: err } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password: sandi });
      if (err) { setError(terjemahError(err.message)); setLoading(false); return; }
      reset();
      const next = new URLSearchParams(window.location.search).get('next');
      const aman = next && next.startsWith('/') && !next.startsWith('//') && !['/login', '/register'].includes(next);
      router.push(aman ? next : '/beranda');
      router.refresh();
    } catch (ex) {
      setError(terjemahError(ex.message));
      setLoading(false);
    }
  };

  return (
    <AuthCard judul="Masuk ke NutriKos">
      <form onSubmit={masuk} className="space-y-4" noValidate>
        <Field id="email" label="Email" Icon={Mail}>
          <input id="email" type="email" autoComplete="email" placeholder="contoh: nama@campus.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} className={kelasInput} />
        </Field>
        <Field id="sandi" label="Kata Sandi">
          <InputSandi id="sandi" Icon={Lock} autoComplete="current-password" placeholder="Masukkan kata sandi" value={sandi} onChange={(e) => setSandi(e.target.value)} />
        </Field>
        <div className="text-right"><Link href="/lupa-sandi" className="text-xs font-bold text-brand-dark hover:underline">Lupa Kata Sandi?</Link></div>
        <Pesan>{error}</Pesan>
        <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-full py-3.5 text-base shadow-md disabled:opacity-70">
          {loading ? 'Memeriksa...' : <>Masuk Sekarang <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">Belum punya akun NutriKos? <Link href="/register" className="font-bold text-brand-dark hover:underline">Daftar Sekarang</Link></p>
    </AuthCard>
  );
}
