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
    try {
      supabase = supabaseBrowser();
    } catch {
      setStatus('tidak-valid');
      return;
    }

    const periksaToken = async () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash || '';
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      // 1. Cek bila Supabase melaporkan error di URL hash/query
      if (hash.includes('error=') || params.get('error')) {
        const errorDesc = params.get('error_description') || 'Tautan reset kata sandi ini sudah kedaluwarsa atau tidak benar.';
        if (!batal) {
          setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          setStatus('tidak-valid');
        }
        return;
      }

      // 2. Jika tautan memakai alur PKCE (ada ?code=...)
      if (code) {
        try {
          const { data, error: errCode } = await supabase.auth.exchangeCodeForSession(code);
          if (!errCode && data?.session) {
            if (!batal) setStatus('siap');
            return;
          }
        } catch (e) {
          console.error('Gagal exchange code:', e);
        }
      }

      // 3. Cek apakah sesi pemulihan sudah aktif
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !batal) {
        setStatus('siap');
        return;
      }

      // 4. Pasang listener Auth State Change untuk event PASSWORD_RECOVERY
      const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
        if ((event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && s)) && !batal) {
          setStatus('siap');
        }
      });

      // 5. Beri waktu tunggu 3 detik untuk pertukaran token sebelum menyatakan tidak valid
      const timeout = setTimeout(() => {
        if (!batal) {
          setStatus((current) => (current === 'memeriksa' ? 'tidak-valid' : current));
        }
      }, 3000);

      return () => {
        sub?.subscription?.unsubscribe();
        clearTimeout(timeout);
      };
    };

    let cleanupFn;
    periksaToken().then((clean) => {
      cleanupFn = clean;
    });

    return () => {
      batal = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  const simpan = async (e) => {
    e.preventDefault();
    setError('');
    if (sandi.length < SANDI_MIN) return setError(`Kata sandi minimal ${SANDI_MIN} karakter.`);
    if (kuat.skor < 3) return setError('Kata sandi harus Kuat (kombinasi huruf besar, huruf kecil, angka, dan simbol atau min. 10 karakter dengan angka).');
    if (sandi !== ulang) return setError('Konfirmasi kata sandi tidak sama.');
    setLoading(true);
    const { error: err } = await supabaseBrowser().auth.updateUser({ password: sandi });
    if (err) { setError(terjemahError(err.message)); setLoading(false); return; }
    setSelesai(true);
    setLoading(false);
    setTimeout(() => { router.push('/beranda'); router.refresh(); }, 1500);
  };

  if (status === 'memeriksa') return <AuthCard judul="Memeriksa tautan..."><p className="text-center text-sm text-slate-500">Mohon tunggu sebentar.</p></AuthCard>;
  if (status === 'tidak-valid') {
    return (
      <AuthCard judul="Tautan Tidak Valid" deskripsi={error || "Tautan reset kata sandi ini sudah kedaluwarsa atau tidak benar. Minta tautan baru."}>
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
