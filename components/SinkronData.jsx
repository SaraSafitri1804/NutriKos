'use client';
import { useEffect, useRef } from 'react';
import { useApp, hariIni } from './AppProvider';
import { supabaseBrowser } from '@/lib/supabase/client';
import { getRecipe, SLOTS } from '@/lib/data';
import { laporSync } from '@/lib/sync-status';

// Sinkronisasi menu terjadwal (jadwal_makan), favorit, dan riwayat menu (riwayat_menu) - langkah 7b.
// Dimuat setelah profil akun selesai dimuat oleh SesiSync (ditandai profile.akunId).

const urutSlot = (id) => { const i = SLOTS.indexOf(getRecipe(id)?.slot); return i === -1 ? 9 : i; };
const kunciJadwal = (plan, rinci) => JSON.stringify([plan, plan.map((id) => rinci?.[id] || null)]);
const kunciHari = (ids) => JSON.stringify([...new Set(ids)].sort());
const hariLalu = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export default function SinkronData() {
  const { ready, profile, plan, customPlanDetails, favorit, log, hydrate } = useApp();
  const akunId = profile?.akunId;
  const terbaru = useRef({});
  terbaru.current = { plan, customPlanDetails, favorit, log };
  const muatUntuk = useRef(null);   // akun yang datanya sudah dimuat
  const sedangMuat = useRef(false);
  const dasar = useRef(null);       // kondisi terakhir yang sudah sama dengan database

  // 1) Muat dari database
  useEffect(() => {
    if (!ready) return;
    if (!akunId) { muatUntuk.current = null; dasar.current = null; return; } // setelah reset: muat ulang saat akun kembali terisi
    if (muatUntuk.current === akunId || sedangMuat.current) return;
    sedangMuat.current = true;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const [jd, fv, rw] = await Promise.all([
          sb.from('jadwal_makan').select('resep_id,waktu_makan,rincian').eq('pengguna_id', akunId).eq('tanggal', hariIni()),
          sb.from('favorit').select('resep_id').eq('pengguna_id', akunId).order('tanggal', { ascending: true }),
          sb.from('riwayat_menu').select('tanggal,resep_id').eq('pengguna_id', akunId).gte('tanggal', hariLalu(120)),
        ]);
        if (jd.error || fv.error || rw.error) throw new Error('gagal memuat');

        const lokal = terbaru.current;
        const patch = {};
        // Jadwal hari ini: bila ada di database, database menang; bila tidak, pakai menu lokal tanpa menyimpannya.
        let planDasar = lokal.plan, rinciDasar = lokal.customPlanDetails;
        if (jd.data.length) {
          planDasar = jd.data.map((r) => r.resep_id).sort((a, b) => urutSlot(a) - urutSlot(b));
          rinciDasar = {};
          jd.data.forEach((r) => { if (r.rincian && Object.keys(r.rincian).length) rinciDasar[r.resep_id] = r.rincian; });
          patch.plan = planDasar;
          patch.customPlanDetails = rinciDasar;
        }
        const favDasar = fv.data.map((r) => r.resep_id);
        const logDasar = {};
        rw.data.forEach((r) => { (logDasar[r.tanggal] = logDasar[r.tanggal] || []).push(r.resep_id); });
        patch.favorit = favDasar;
        patch.log = logDasar;

        dasar.current = { jadwal: kunciJadwal(planDasar, rinciDasar), favorit: favDasar, log: logDasar };
        muatUntuk.current = akunId;
        hydrate(patch);
      } catch (e) {
        console.warn('NutriKos: tidak bisa memuat menu dan favorit dari database.', e?.message);
      } finally {
        sedangMuat.current = false;
      }
    })();
  }, [ready, akunId, hydrate]);

  // 2) Simpan perubahan
  useEffect(() => {
    if (!akunId || muatUntuk.current !== akunId || !dasar.current) return;
    const d = dasar.current;
    const jadwalKini = kunciJadwal(plan, customPlanDetails);
    const jadwalBerubah = jadwalKini !== d.jadwal;
    const favTambah = favorit.filter((x) => !d.favorit.includes(x));
    const favHapus = d.favorit.filter((x) => !favorit.includes(x));
    const hariBerubah = [...new Set([...Object.keys(log), ...Object.keys(d.log)])].filter((t) => kunciHari(log[t] || []) !== kunciHari(d.log[t] || []));
    if (!jadwalBerubah && !favTambah.length && !favHapus.length && !hariBerubah.length) return;

    const t = setTimeout(async () => {
      laporSync('menyimpan');
      try {
        const sb = supabaseBrowser();
        const galat = (r) => { if (r?.error) throw new Error(r.error.message); };
        if (jadwalBerubah) {
          const tgl = hariIni();
          galat(await sb.from('jadwal_makan').delete().eq('pengguna_id', akunId).eq('tanggal', tgl));
          if (plan.length) {
            galat(await sb.from('jadwal_makan').insert([...new Set(plan)].map((id) => ({
              pengguna_id: akunId, resep_id: id, tanggal: tgl, waktu_makan: getRecipe(id)?.slot || 'siang', rincian: customPlanDetails?.[id] || {},
            }))));
          }
        }
        if (favTambah.length) galat(await sb.from('favorit').upsert(favTambah.map((id) => ({ pengguna_id: akunId, resep_id: id })), { onConflict: 'pengguna_id,resep_id' }));
        if (favHapus.length) galat(await sb.from('favorit').delete().eq('pengguna_id', akunId).in('resep_id', favHapus));
        for (const tgl of hariBerubah) {
          galat(await sb.from('riwayat_menu').delete().eq('pengguna_id', akunId).eq('tanggal', tgl));
          const ids = [...new Set(log[tgl] || [])];
          if (ids.length) galat(await sb.from('riwayat_menu').insert(ids.map((id) => ({ pengguna_id: akunId, resep_id: id, tanggal: tgl }))));
        }
        dasar.current = { jadwal: jadwalKini, favorit: [...favorit], log: JSON.parse(JSON.stringify(log)) };
        laporSync('tersimpan');
      } catch (e) {
        console.warn('NutriKos: gagal menyimpan menu/favorit.', e?.message);
        laporSync('gagal');
      }
    }, 800);
    return () => clearTimeout(t);
  }, [akunId, plan, customPlanDetails, favorit, log]);

  return null;
}
