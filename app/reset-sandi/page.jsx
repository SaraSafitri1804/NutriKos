'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthCard, Field, InputSandi, Pesan } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';
import { terjemahError, kekuatanSandi, SANDI_MIN } from '@/lib/auth-utils';

export default function ResetSandi() {
  const router = useRouter();
  const [status, setStatus] = useState('memeriksa'); // memeriksa | siap | tidak-valid
  const [sandi, setSandi] = useState('');
  const [ulang, setUlang] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selesai, setSelesai] = useState(false);
  const kuat = kekuatanSandi(sandi);

  useEffect(() => {
    let batal = false;
    let supabase;
    try { supabase = supabaseBrowser(); } catch { setStatus('tidak-valid'); return; }
    // Tautan di email membawa kode yang ditukar otomatis menjadi sesi pemulihan.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY' && !batal) setStatus('siap'); });
    supabase.auth.getSession().then(({ data }) => { if (!batal) setStatus((s) => (data.session ? 'siap' : s === 'siap' ? s : 'tidak-valid')); });
    return () => { batal = true; sub.subscription.unsubscribe(); };
  }, []);

  const simpan = async (e) => {
    e.preventDefault();
    setError('');
    if (sandi.length < SANDI_MIN) return setError(`Kata sandi minimal ${SANDI_MIN} karakter.`);
    if (sandi !== ulang) return setError('Konfirmasi kata sandi tidak sama.');
    setLoading(true);
    const { error: err } = await supabaseBrowser().auth.updateUser({ password: sandi });
    if (err) { setError(terjemahError(err.message)); setLoading(false); return; }
    setSelesai(true);
    setLoading(false);
    setTimeout(() => { router.push('/'); router.refresh(); }, 1500);
  };

  if (status === 'memeriksa') return <AuthCard judul="Memeriksa tautan..."><p className="text-center text-sm text-slate-500">Mohon tunggu sebentar.</p></AuthCard>;
  if (status === 'tidak-valid') {
    return (
      <AuthCard judul="Tautan Tidak Valid" deskripsi="Tautan reset kata sandi ini sudah kedaluwarsa atau tidak benar. Minta tautan baru.">
        <Link href="/lupa-sandi" className="btn btn-primary w-full rounded-full py-3.5">Minta Tautan Baru</Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard badge="Pemulihan Akun" judul="Buat Kata Sandi Baru" deskripsi="Pilih kata sandi baru yang kuat untuk akun NutriKos-mu.">
      <form onSubmit={simpan} className="space-y-4" noValidate>
        <div>
          <Field id="sandi" label="Kata Sandi Baru">
            <InputSandi id="sandi" Icon={Lock} autoComplete="new-password" placeholder={`Minimal ${SANDI_MIN} karakter`} value={sandi} onChange={(e) => setSandi(e.target.value)} />
          </Field>
          <div className="mt-2 flex gap-1.5" aria-hidden="true">{[1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${kuat.skor >= i ? (kuat.skor === 3 ? 'bg-success' : kuat.skor === 2 ? 'bg-brand-dark' : 'bg-accent') : 'bg-slate-200'}`} />)}</div>
          <div className="mt-1 text-right text-[11px] text-slate-500">{kuat.label}</div>
        </div>
        <Field id="ulang" label="Konfirmasi Kata Sandi">
          <InputSandi id="ulang" Icon={ShieldCheck} autoComplete="new-password" placeholder="Ulangi kata sandi" value={ulang} onChange={(e) => setUlang(e.target.value)} />
        </Field>
        <Pesan>{error}</Pesan>
        {selesai && <Pesan jenis="ok">Kata sandi berhasil diubah. Mengalihkan...</Pesan>}
        <button type="submit" disabled={loading || selesai} className="btn btn-primary w-full rounded-full py-3.5 text-base shadow-md disabled:opacity-70">
          {loading ? 'Menyimpan...' : <>Simpan Kata Sandi <ArrowRight size={18} /></>}
        </button>
      </form>
    </AuthCard>
  );
}
