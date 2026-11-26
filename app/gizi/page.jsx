'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Flame, Beef, Wheat, Salad, SlidersHorizontal, AlertTriangle, CheckCircle2, Wallet, Info } from 'lucide-react';
import { useApp, kunciTanggal } from '@/components/AppProvider';
import Ring from '@/components/Ring';
import { nutrisiDari } from '@/lib/recommend';
import { getRecipe, rupiah, targetGizi, SLOT_LABEL } from '@/lib/data';

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const NOL = { protein: 0, serat: 0, karbo: 0, kalori: 0, biaya: 0 };

// Ambang skor mengikuti proposal (Bab 3.6): Cukup >= 80, Perlu Ditingkatkan 50-79, Kurang < 50.
const kategori = (skor) => (skor >= 80 ? 'Cukup' : skor >= 50 ? 'Perlu Ditingkatkan' : 'Kurang');
const nada = (p) => (p >= 80 ? 'bg-success-light text-success-dark' : p >= 50 ? 'bg-accent-light text-amber-800' : 'bg-red-100 text-red-700');
const warnaBar = (p) => (p >= 80 ? 'bg-success' : p >= 50 ? 'bg-brand-dark' : 'bg-accent');

function StatCard({ Icon, judul, nilai, satuan, target, persen }) {
  return (
    <div className="card space-y-2 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark"><Icon size={19} /></span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${nada(persen)}`}>{persen}% tercapai</span>
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{judul}</div>
      <div className="text-3xl font-extrabold">{nilai} <span className="text-base font-medium text-slate-500">{satuan}</span></div>
      <div className="text-xs text-slate-500">Target: {target} {satuan} / hari</div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${warnaBar(persen)}`} style={{ width: `${Math.min(100, persen)}%` }} /></div>
    </div>
  );
}

export default function Gizi() {
  const { profile, plan, log, logToday, customPlanDetails, ready } = useApp();
  const [offset, setOffset] = useState(0); // 0 = minggu ini, -1 = minggu lalu, dst.
  if (!ready) return null;

  const T = targetGizi(profile);
  const sekarang = new Date();
  const kunciHariIni = kunciTanggal(sekarang);
  const idxHariIni = (sekarang.getDay() + 6) % 7;
  const senin = new Date(sekarang.getTime() + (-idxHariIni + offset * 7) * 86400000);

  // Satu minggu (Senin-Minggu). Hari ini memakai menu aktif; hari lain memakai riwayat catatan.
  const hari = HARI.map((nama, i) => {
    const d = new Date(senin.getTime() + i * 86400000);
    const key = kunciTanggal(d);
    const adalahHariIni = key === kunciHariIni;
    const ids = adalahHariIni ? plan : log?.[key] || [];
    const n = ids.length ? nutrisiDari(ids, adalahHariIni ? customPlanDetails : {}) : NOL;
    return { key, nama, tgl: d.getDate(), ada: ids.length > 0, n, hariIni: adalahHariIni, tercatat: !!log?.[key] };
  });
  const aktif = hari.filter((h) => h.ada);
  const jml = aktif.length;
  const rata = (k) => (jml ? Math.round(aktif.reduce((s, h) => s + h.n[k], 0) / jml) : 0);
  const avg = { kalori: rata('kalori'), protein: rata('protein'), karbo: rata('karbo'), serat: rata('serat'), biaya: rata('biaya') };
  const pct = (v, t) => Math.round((v / t) * 100);
  const p = { kalori: pct(avg.kalori, T.kalori), protein: pct(avg.protein, T.protein), karbo: pct(avg.karbo, T.karbo), serat: pct(avg.serat, T.serat) };

  // Skor mingguan = rata-rata skor protein, karbohidrat, sayur (serat sebagai pendekatan), masing-masing maks 100.
  const skor = jml ? Math.round((Math.min(100, p.protein) + Math.min(100, p.karbo) + Math.min(100, p.serat)) / 3) : 0;
  const status = kategori(skor);

  const totalKalori = aktif.reduce((s, h) => s + h.n.kalori, 0);
  const maksBar = Math.max(T.kalori * 1.1, ...hari.map((h) => h.n.kalori));
  const garisTarget = (T.kalori / maksBar) * 100;
  const hariTerdekat = jml ? [...aktif].sort((a, b) => Math.abs(a.n.kalori - T.kalori) - Math.abs(b.n.kalori - T.kalori))[0] : null;
  const hariTerendah = jml > 1 ? [...aktif].sort((a, b) => a.n.kalori - b.n.kalori)[0] : null;

  const fmt = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const minggu = new Date(senin.getTime() + 6 * 86400000);
  const rentang = `${fmt(senin)} – ${fmt(minggu)} ${minggu.getFullYear()}`;

  const kurangSerat = p.serat < 80;
  const kurangProtein = p.protein < 80;
  const tercatatHariIni = !!log?.[kunciHariIni];

  return (
    <div className="space-y-6">
      {/* Judul */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Gizi Mingguan</h1>
          <p className="text-slate-600">Pantau kebutuhan kalori dan keseimbangan nutrisimu selama seminggu.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2 py-1.5 text-sm font-bold shadow-sm">
            <button aria-label="Minggu sebelumnya" onClick={() => setOffset(offset - 1)} className="rounded-full p-1 hover:bg-slate-100"><ChevronLeft size={16} /></button>
            <span className="px-1">{rentang}</span>
            <button aria-label="Minggu berikutnya" disabled={offset >= 0} onClick={() => setOffset(offset + 1)} className="rounded-full p-1 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
          <Link href="/profil-kos" className="btn btn-primary whitespace-nowrap"><SlidersHorizontal size={16} /> Atur Target Gizi</Link>
        </div>
      </div>

      {jml === 0 && (
        <div className="card text-sm text-slate-600">Belum ada menu yang tercatat di minggu ini. Pilih menu di <Link href="/menu" className="font-bold text-brand-dark underline">Rekomendasi Menu</Link>, lalu tekan "Catat Makan Hari Ini".</div>
      )}

      {/* Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Flame} judul="Rata-rata kalori" nilai={avg.kalori.toLocaleString('id-ID')} satuan="kkal" target={T.kalori.toLocaleString('id-ID')} persen={p.kalori} />
        <StatCard Icon={Beef} judul="Protein harian" nilai={avg.protein} satuan="g" target={T.protein} persen={p.protein} />
        <StatCard Icon={Wheat} judul="Karbohidrat" nilai={avg.karbo} satuan="g" target={T.karbo} persen={p.karbo} />
        <StatCard Icon={Salad} judul="Sayur & serat" nilai={avg.serat} satuan="g" target={T.serat} persen={p.serat} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Tren kalori */}
        <section className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold">Tren Kalori Harian</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Senin – Minggu</span></div>
          <div className="text-3xl font-extrabold">{totalKalori.toLocaleString('id-ID')} <span className="text-lg font-medium text-slate-500">kkal</span></div>
          <p className="text-xs text-slate-500">Rata-rata {avg.kalori.toLocaleString('id-ID')} kkal/hari dari target {T.kalori.toLocaleString('id-ID')} kkal/hari ({jml} hari tercatat).</p>
          <div className="mt-5 h-52 rounded-2xl bg-slate-50 px-3 pb-8 pt-5">
            <div className="relative flex h-full gap-3">
              <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-400" style={{ bottom: `${garisTarget}%` }}>
                <span className="absolute -top-4 right-0 text-[10px] text-slate-500">Target {T.kalori.toLocaleString('id-ID')} kkal</span>
              </div>
              {hari.map((h) => {
                const tinggi = h.ada ? (h.n.kalori / maksBar) * 100 : 0;
                return (
                  <div key={h.key} className="relative h-full flex-1">
                    <div className={`absolute inset-x-0 bottom-0 rounded-t-lg ${h.ada ? (h.hariIni ? 'bg-brand-dark' : 'bg-brand-mint') : 'bg-slate-200'}`} style={{ height: h.ada ? `${tinggi}%` : '4px' }} title={h.ada ? `${h.n.kalori} kkal` : 'Belum ada data'} />
                    {h.ada && <span className="absolute inset-x-0 text-center text-[10px] font-bold text-slate-600" style={{ bottom: `calc(${tinggi}% + 2px)` }}>{h.n.kalori.toLocaleString('id-ID')}</span>}
                    <span className={`absolute inset-x-0 -bottom-6 text-center text-[11px] ${h.hariIni ? 'font-extrabold text-brand-dark' : 'text-slate-500'}`}>{h.nama}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
            {hariTerdekat && <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-success" /> <span><b>Paling mendekati target:</b> {hariTerdekat.nama} ({hariTerdekat.n.kalori.toLocaleString('id-ID')} kkal)</span></div>}
            {hariTerendah && <div className="flex items-center gap-2"><AlertTriangle size={15} className="text-accent" /> <span><b>Asupan terendah:</b> {hariTerendah.nama} ({hariTerendah.n.kalori.toLocaleString('id-ID')} kkal)</span></div>}
            {!hariTerdekat && <div className="text-slate-500">Data akan muncul setelah ada menu yang dijadwalkan.</div>}
          </div>
        </section>

        {/* Pemenuhan AKG */}
        <section className="card flex flex-col p-5">
          <h2 className="text-lg font-extrabold">Pemenuhan Gizi (AKG)</h2>
          <p className="mb-4 text-xs text-slate-500">AKG 2019, {profile.jenisKelamin || 'Perempuan'} usia 19–29 tahun. Rata-rata per hari.</p>
          <div className="space-y-4">
            <Ring horizontal persen={p.kalori} label="Kalori" detail={`${avg.kalori} / ${T.kalori} kkal`} />
            <Ring horizontal persen={p.protein} label="Protein" detail={`${avg.protein}g / ${T.protein}g`} />
            <Ring horizontal persen={p.karbo} label="Karbohidrat" detail={`${avg.karbo}g / ${T.karbo}g`} />
            <Ring horizontal persen={p.serat} label="Serat" detail={`${avg.serat}g / ${T.serat}g`} />
          </div>
          <div className={`mt-5 rounded-2xl p-4 ${nada(skor)}`}>
            <div className="text-xs opacity-80">Status Gizi Minggu Ini (skor {skor}/100)</div>
            <div className="text-lg font-extrabold">{jml ? status : 'Belum ada data'}</div>
          </div>
        </section>
      </div>

      {/* Catatan & rekomendasi */}
      <section className="card p-5">
        <h2 className="text-lg font-extrabold">Catatan & Rekomendasi Nutrisi</h2>
        <p className="mb-4 text-xs text-slate-500">Disesuaikan dengan anggaran dan alat masak di Profil Kos.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-2xl p-4 ${kurangSerat ? 'bg-accent-light' : 'bg-success-light'}`}>
            <div className="font-extrabold">{kurangSerat ? `Tingkatkan Asupan Serat (+${Math.max(0, 100 - p.serat)}%)` : 'Asupan Serat Terjaga'}</div>
            <p className="mt-2 text-sm text-slate-700">
              {jml ? `Rata-rata serat ${avg.serat}g dari anjuran ${T.serat}g. ` : ''}
              {kurangSerat ? 'Tambahkan tumis kangkung, lalapan, atau buah potong pada menu makan siang dan malam.' : 'Pertahankan sayur dan buah di setiap waktu makan.'}
            </p>
            {kurangSerat && <Link href="/menu" className="mt-3 inline-block text-xs font-bold text-brand-dark">+ Lihat Rekomendasi Menu</Link>}
          </div>
          <div className={`rounded-2xl p-4 ${kurangProtein ? 'bg-accent-light' : 'bg-success-light'}`}>
            <div className="font-extrabold">{kurangProtein ? 'Protein Perlu Ditambah' : 'Protein Terjaga'}</div>
            <p className="mt-2 text-sm text-slate-700">
              {jml ? `Rata-rata protein ${avg.protein}g dari anjuran ${T.protein}g (${p.protein}%). ` : ''}
              {kurangProtein ? 'Tambah lauk murah seperti telur, tahu, atau tempe.' : 'Kombinasi lauk hemat di menumu sudah mencukupi.'}
            </p>
          </div>
          <div className="rounded-2xl bg-brand-light p-4">
            <div className="flex items-center gap-2 font-extrabold"><Wallet size={16} /> Pengeluaran Makan</div>
            <p className="mt-2 text-sm text-slate-700">
              {jml ? `Rata-rata ${rupiah(avg.biaya)}/hari dari bujet ${rupiah(profile.budget)}/hari. ${avg.biaya <= profile.budget ? 'Masih dalam bujet.' : 'Sedikit melebihi bujet.'}` : 'Belum ada data pengeluaran minggu ini.'}
            </p>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500"><Info size={14} className="mt-0.5 shrink-0" /> Skor hanya menghitung menu yang dijadwalkan di NutriKos, tidak termasuk jajan di luar aplikasi. Nilai serat dipakai sebagai pendekatan asupan sayur. Ini panduan umum, bukan diagnosis atau pengganti saran ahli gizi.</p>
      </section>

      {/* Menu hari ini + catat */}
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between text-sm font-bold"><span className="text-lg font-extrabold">Menu Hari Ini</span><span className={tercatatHariIni ? 'text-success-dark' : 'text-slate-400'}>{tercatatHariIni ? 'Tercatat' : 'Belum dicatat'}</span></div>
        <ul className="grid gap-2 text-sm md:grid-cols-3">
          {plan.map((id) => getRecipe(id)).filter(Boolean).map((r) => {
            const porsi = customPlanDetails?.[r.id]?.porsi || 1;
            return (
              <li key={r.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span><span className="text-xs text-slate-500">{SLOT_LABEL[r.slot]} {porsi > 1 ? `(${porsi} porsi)` : ''}</span><br />{r.emoji} {r.nama}</span>
                <span className="font-semibold text-slate-500">{rupiah(r.harga * porsi)}</span>
              </li>
            );
          })}
        </ul>
        <button onClick={logToday} className="btn btn-primary mt-4 w-full sm:w-auto"><Plus size={18} /> Catat Makan Hari Ini</button>
      </section>
    </div>
  );
}
