'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from './AppProvider';
import { supabaseBrowser } from '@/lib/supabase/client';
import { DEFAULT_PROFILE } from '@/lib/data';

// Sinkronisasi profil dengan database Supabase (langkah 7a).
//  - Saat halaman dibuka: data akun dimuat dari tabel pengguna, profil_kos, dan bahan_sisa.
//    Database menjadi sumber data utama, sehingga akun yang sama di HP dan laptop sama isinya.
//  - Saat profil berubah: perubahan disimpan ke database (ditunda 0,8 detik agar tidak terlalu sering).
// Bila akun berbeda dari akun sebelumnya di perangkat ini, data lokal lama dihapus lebih dulu.

const kunciIdentitas = (p) => JSON.stringify([p.nama, p.kampus, p.prodi, String(p.semester || ''), p.avatar]);
const kunciKos = (p) => JSON.stringify([p.budget, p.alat, p.pantangan, p.jenisKelamin, p.lokasi]);
const kunciStok = (p) => JSON.stringify(p.stok);

export default function SesiSync() {
  const { ready, profile, setProfile, reset } = useApp();
  const akunId = profile?.akunId;
  const [dbSiap, setDbSiap] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | menyimpan | tersimpan | gagal
  const sedangMuat = useRef(false);
  const gagalMuat = useRef(false); // tanpa login/jaringan: jangan coba berulang pada tiap perubahan profil
  const userId = useRef(null);
  const terakhir = useRef({ identitas: '', kos: '', stok: '' });

  // Status simpan dari komponen sinkronisasi lain (menu, favorit, riwayat)
  useEffect(() => {
    let t;
    const dengar = (e) => { setStatus(e.detail); clearTimeout(t); if (e.detail === 'tersimpan') t = setTimeout(() => setStatus((s) => (s === 'tersimpan' ? 'idle' : s)), 2000); };
    window.addEventListener('nutrikos-sync', dengar);
    return () => { window.removeEventListener('nutrikos-sync', dengar); clearTimeout(t); };
  }, []);

  // 1) Muat dari database (saat pertama dibuka, dan lagi bila data lokal direset)
  useEffect(() => {
    if (!ready || sedangMuat.current || gagalMuat.current || (dbSiap && akunId)) return;
    sedangMuat.current = true;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { gagalMuat.current = true; return; }
        const [pg, kos, stok] = await Promise.all([
          sb.from('pengguna').select('nama,email,kampus,program_studi,semester,avatar').eq('id', user.id).maybeSingle(),
          sb.from('profil_kos').select('budget_harian,alat_masak,alergi_pantangan,jenis_kelamin,lokasi').eq('pengguna_id', user.id).maybeSingle(),
          sb.from('bahan_sisa').select('nama').eq('pengguna_id', user.id).order('dibuat_pada', { ascending: true }),
        ]);
        if (pg.error || kos.error || stok.error) throw new Error('gagal memuat');
        const akunLain = akunId && akunId !== user.id;
        if (akunLain) reset();
        const dasar = akunLain ? DEFAULT_PROFILE : profile;
        const patch = {
          akunId: user.id,
          nama: pg.data?.nama || user.user_metadata?.nama || 'Pengguna NutriKos',
          email: pg.data?.email || user.email || '',
          kampus: pg.data?.kampus ?? user.user_metadata?.kampus ?? '',
          prodi: pg.data?.program_studi || '',
          semester: pg.data?.semester ? String(pg.data.semester) : '1',
          avatar: pg.data?.avatar || dasar.avatar,
          budget: kos.data?.budget_harian ?? dasar.budget,
          alat: kos.data?.alat_masak ?? dasar.alat,
          pantangan: kos.data?.alergi_pantangan ?? dasar.pantangan,
          jenisKelamin: kos.data?.jenis_kelamin || dasar.jenisKelamin,
          lokasi: kos.data?.lokasi ?? dasar.lokasi,
          stok: (stok.data || []).map((r) => r.nama),
        };
        const gabung = { ...dasar, ...patch };
        terakhir.current = { identitas: kunciIdentitas(gabung), kos: kunciKos(gabung), stok: kunciStok(gabung) };
        userId.current = user.id;
        setProfile(patch);
        setDbSiap(true);
      } catch (e) {
        gagalMuat.current = true;
        console.warn('NutriKos: tidak bisa memuat data akun, memakai data lokal.', e?.message);
      } finally {
        sedangMuat.current = false;
      }
    })();
  }, [ready, dbSiap, akunId, profile, setProfile, reset]);

  // 2) Simpan perubahan profil ke database
  useEffect(() => {
    if (!dbSiap || !akunId || !userId.current) return;
    const kini = { identitas: kunciIdentitas(profile), kos: kunciKos(profile), stok: kunciStok(profile) };
    const berubah = Object.keys(kini).filter((k) => kini[k] !== terakhir.current[k]);
    if (berubah.length === 0) return;

    const id = userId.current;
    const t = setTimeout(async () => {
      setStatus('menyimpan');
      try {
        const sb = supabaseBrowser();
        const tugas = [];
        if (berubah.includes('identitas')) {
          tugas.push(sb.from('pengguna').update({
            nama: profile.nama, kampus: profile.kampus || null, program_studi: profile.prodi || null,
            semester: parseInt(profile.semester, 10) || null, avatar: profile.avatar,
          }).eq('id', id));
        }
        if (berubah.includes('kos')) {
          tugas.push(sb.from('profil_kos').upsert({
            pengguna_id: id, budget_harian: profile.budget, alat_masak: profile.alat,
            alergi_pantangan: profile.pantangan, jenis_kelamin: profile.jenisKelamin, lokasi: profile.lokasi,
          }, { onConflict: 'pengguna_id' }));
        }
        if (berubah.includes('stok')) {
          tugas.push((async () => {
            const del = await sb.from('bahan_sisa').delete().eq('pengguna_id', id);
            if (del.error) return del;
            if (!profile.stok.length) return { error: null };
            return sb.from('bahan_sisa').insert(profile.stok.map((nama) => ({ pengguna_id: id, nama })));
          })());
        }
        const hasil = await Promise.all(tugas);
        if (hasil.some((r) => r.error)) throw new Error(hasil.find((r) => r.error).error.message);
        berubah.forEach((k) => { terakhir.current[k] = kini[k]; });
        setStatus('tersimpan');
        setTimeout(() => setStatus((s) => (s === 'tersimpan' ? 'idle' : s)), 2000);
      } catch (e) {
        console.warn('NutriKos: gagal menyimpan ke database.', e?.message);
        setStatus('gagal');
      }
    }, 800);
    return () => clearTimeout(t);
  }, [profile, dbSiap, akunId]);

  if (status === 'idle') return null;
  const teks = { menyimpan: 'Menyimpan...', tersimpan: 'Tersimpan di akun', gagal: 'Gagal menyimpan. Periksa koneksi lalu ubah lagi.' }[status];
  const warna = status === 'gagal' ? 'bg-red-600' : status === 'tersimpan' ? 'bg-success-dark' : 'bg-slate-700';
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-24 left-4 z-50 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg lg:bottom-5 lg:left-[19rem] ${warna}`}>{teks}</div>
  );
}
