'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Flame, Beef, Wheat, Salad, SlidersHorizontal, AlertTriangle, CheckCircle2, Wallet, Info, Calendar } from 'lucide-react';
import { useApp, kunciTanggal } from '@/components/AppProvider';
import Ring from '@/components/Ring';
import { nutrisiDari } from '@/lib/recommend';
import { getRecipe, rupiah, targetGizi, SLOT_LABEL } from '@/lib/data';

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const NAMA_LENGKAP_HARI = {
  Sen: 'Senin',
  Sel: 'Selasa',
  Rab: 'Rabu',
  Kam: 'Kamis',
  Jum: 'Jumat',
  Sab: 'Sabtu',
  Min: 'Minggu',
};
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
  const [terpilihKey, setTerpilihKey] = useState(null);

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
    const tanggalFormat = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return {
      key,
      nama,
      namaLengkap: NAMA_LENGKAP_HARI[nama] || nama,
      tgl: d.getDate(),
      tanggalFormat,
      dateObj: d,
      ada: ids.length > 0,
      n,
      ids,
      hariIni: adalahHariIni,
      tercatat: !!log?.[key],
    };
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

  // Hari yang sedang dipilih untuk melihat detail gizi & menunya (default: hari ini jika ada di minggu ini, atau hari pertama)
  const hariAktif = hari.find((h) => h.key === (terpilihKey || kunciHariIni)) || hari[0];

  return (
    <div className="space-y-6">
      {/* Judul & Navigasi Tanggal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Gizi Mingguan</h1>
          <p className="text-slate-600">Pantau kebutuhan kalori dan keseimbangan nutrisimu selama seminggu.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          {/* Kontrol Navigasi Rentang Minggu */}
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2.5 py-1.5 text-sm font-bold shadow-sm border border-slate-100">
            <button
              aria-label="Minggu sebelumnya"
              onClick={() => setOffset((o) => o - 1)}
              className="rounded-full p-1 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 font-extrabold text-slate-800">{rentang}</span>
            <button
              aria-label="Minggu berikutnya"
              disabled={offset >= 0}
              onClick={() => setOffset((o) => o + 1)}
              className="rounded-full p-1 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              title="Minggu Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Pemilih Tanggal Kalender (Date Picker) */}
          <div className="relative">
            <input
              type="date"
              id="date-picker-gizi"
              className="sr-only"
              onChange={(e) => {
                if (!e.target.value) return;
                const [thn, bln, tgl] = e.target.value.split('-').map(Number);
                const dipilih = new Date(thn, bln - 1, tgl);
                const diffTime = dipilih.getTime() - sekarang.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const targetOffset = Math.floor((diffDays + idxHariIni) / 7);
                setOffset(targetOffset);
                setTerpilihKey(e.target.value);
              }}
            />
            <label
              htmlFor="date-picker-gizi"
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200/80"
              title="Klik untuk memilih tanggal dari kalender"
            >
              <Calendar size={14} className="text-brand-dark" />
              <span>Pilih Tanggal</span>
            </label>
          </div>

          <Link href="/profil-kos" className="btn btn-primary whitespace-nowrap !py-2"><SlidersHorizontal size={16} /> Atur Target Gizi</Link>
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
        {/* Tren kalori - Tanggal dan Bar Sekarang Interaktif & Bisa Diklik */}
        <section className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Tren Kalori Harian</h2>
              <p className="text-xs text-slate-500">Klik tanggal/batang grafik di bawah untuk melihat rincian makanan hari itu.</p>
            </div>
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-extrabold text-brand-dark">
              {hariAktif.namaLengkap}, {hariAktif.tgl} terpilih
            </span>
          </div>

          <div className="text-3xl font-extrabold">{totalKalori.toLocaleString('id-ID')} <span className="text-lg font-medium text-slate-500">kkal</span></div>
          <p className="text-xs text-slate-500">Rata-rata {avg.kalori.toLocaleString('id-ID')} kkal/hari dari target {T.kalori.toLocaleString('id-ID')} kkal/hari ({jml} hari tercatat).</p>

          {/* Area Grafik Bar Interaktif */}
          <div className="mt-5 h-56 rounded-2xl bg-slate-50 px-2 sm:px-4 pb-8 pt-5">
            <div className="relative flex h-full gap-1.5 sm:gap-3">
              <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-400 z-10" style={{ bottom: `${garisTarget}%` }}>
                <span className="absolute -top-4 right-0 text-[10px] text-slate-500 bg-slate-50/80 px-1 rounded">Target {T.kalori.toLocaleString('id-ID')} kkal</span>
              </div>
              {hari.map((h) => {
                const tinggi = h.ada ? (h.n.kalori / maksBar) * 100 : 0;
                const isSelected = h.key === hariAktif.key;
                return (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => setTerpilihKey(h.key)}
                    className={`relative h-full flex-1 flex flex-col justify-end items-center rounded-xl transition-all cursor-pointer p-1 group outline-none ${
                      isSelected
                        ? 'bg-brand-light/70 ring-2 ring-brand-dark shadow-xs'
                        : 'hover:bg-slate-200/50'
                    }`}
                    title={`Klik untuk melihat detail ${h.namaLengkap}, ${h.tanggalFormat} (${h.ada ? h.n.kalori + ' kkal' : 'Belum ada data'})`}
                  >
                    {/* Nilai kalori di atas batang */}
                    {h.ada && (
                      <span className={`text-[10px] mb-1 transition-all ${
                        isSelected ? 'font-black text-brand-dark scale-105' : 'font-bold text-slate-600'
                      }`}>
                        {h.n.kalori.toLocaleString('id-ID')}
                      </span>
                    )}

                    {/* Batang Bar */}
                    <div className="w-full flex-1 flex flex-col justify-end items-center">
                      <div
                        className={`w-full max-w-[2.4rem] rounded-t-lg transition-all ${
                          h.ada
                            ? isSelected
                              ? 'bg-brand-dark shadow-sm'
                              : h.hariIni
                              ? 'bg-brand-dark/85'
                              : 'bg-brand-mint group-hover:bg-brand-mint/80'
                            : 'bg-slate-200'
                        }`}
                        style={{ height: h.ada ? `${tinggi}%` : '6px' }}
                      />
                    </div>

                    {/* Nama Hari & Nomor Tanggal di Bawah */}
                    <div className="mt-2 text-center">
                      <span className={`block text-[11px] leading-tight ${
                        isSelected ? 'font-extrabold text-brand-dark' : h.hariIni ? 'font-bold text-brand-dark' : 'text-slate-600 font-medium'
                      }`}>
                        {h.nama}
                      </span>
                      <span className={`block text-[10px] leading-tight ${
                        isSelected ? 'font-black text-brand-dark' : 'text-slate-400 font-medium'
                      }`}>
                        {h.tgl}
                      </span>
                    </div>

                    {/* Dot Indikator Terpilih */}
                    {isSelected && (
                      <span className="absolute -top-1.5 h-2.5 w-2.5 rounded-full bg-brand-dark ring-2 ring-white shadow-xs animate-in zoom-in-50 duration-150" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
            {hariTerdekat && <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-success" /> <span><b>Paling mendekati target:</b> {hariTerdekat.namaLengkap} ({hariTerdekat.n.kalori.toLocaleString('id-ID')} kkal)</span></div>}
            {hariTerendah && <div className="flex items-center gap-2"><AlertTriangle size={15} className="text-accent" /> <span><b>Asupan terendah:</b> {hariTerendah.namaLengkap} ({hariTerendah.n.kalori.toLocaleString('id-ID')} kkal)</span></div>}
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

      {/* Rincian Menu & Nutrisi Sesuai Tanggal yang Diklik */}
      <section className="card p-5 border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-800">
                Menu &amp; Nutrisi: {hariAktif.namaLengkap}, {hariAktif.tanggalFormat}
              </h2>
              {hariAktif.hariIni && (
                <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-dark">
                  Hari Ini
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {hariAktif.ids.length > 0
                ? `${hariAktif.ids.length} menu tercatat · Estimasi biaya: ${rupiah(hariAktif.n.biaya)}`
                : 'Belum ada menu yang dicatat pada tanggal ini.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              hariAktif.ada ? 'bg-success-light text-success-dark' : 'bg-slate-100 text-slate-500'
            }`}>
              {hariAktif.ada ? (hariAktif.tercatat ? '✓ Sudah Dicatat' : 'Menu Hari Ini Aktif') : 'Belum Dicatat'}
            </span>
          </div>
        </div>

        {/* Ringkasan Makro Nutrisi di Tanggal Terpilih */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[11px] font-semibold text-slate-500">Kalori</div>
            <div className="text-lg font-extrabold text-slate-800">{hariAktif.n.kalori.toLocaleString('id-ID')} kkal</div>
            <div className="text-[10px] text-slate-400">Target: {T.kalori.toLocaleString('id-ID')} kkal</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[11px] font-semibold text-slate-500">Protein</div>
            <div className="text-lg font-extrabold text-slate-800">{hariAktif.n.protein}g</div>
            <div className="text-[10px] text-slate-400">Target: {T.protein}g</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[11px] font-semibold text-slate-500">Karbohidrat</div>
            <div className="text-lg font-extrabold text-slate-800">{hariAktif.n.karbo}g</div>
            <div className="text-[10px] text-slate-400">Target: {T.karbo}g</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[11px] font-semibold text-slate-500">Serat</div>
            <div className="text-lg font-extrabold text-slate-800">{hariAktif.n.serat}g</div>
            <div className="text-[10px] text-slate-400">Target: {T.serat}g</div>
          </div>
        </div>

        {/* Daftar Makanan di Tanggal Terpilih */}
        {hariAktif.ids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500 mb-3">
              Tidak ada catatan menu untuk tanggal {hariAktif.tanggalFormat}.
            </p>
            <Link href="/menu" className="btn btn-primary text-xs rounded-full py-2 px-4 inline-flex items-center gap-1.5">
              + Pilih Menu di Rekomendasi
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hariAktif.ids.map((id) => getRecipe(id)).filter(Boolean).map((r) => {
              const porsi = customPlanDetails?.[r.id]?.porsi || 1;
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-xs">
                    {r.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-brand-dark">
                      {SLOT_LABEL[r.slot]} {porsi > 1 ? `(${porsi} porsi)` : ''}
                    </span>
                    <span className="block truncate text-sm font-extrabold text-slate-800">{r.nama}</span>
                    <span className="block text-xs text-slate-500">
                      {rupiah(r.harga * porsi)} · {r.kalori * porsi} kkal
                    </span>
                  </div>
                  <Link
                    href={`/menu/${r.id}`}
                    aria-label={`Lihat resep ${r.nama}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 hover:text-brand-dark shadow-xs transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Tombol Catat Makan jika tanggal terpilih adalah hari ini dan belum dicatat */}
        {hariAktif.hariIni && !hariAktif.tercatat && (
          <button onClick={logToday} className="btn btn-primary mt-4 w-full sm:w-auto">
            <Plus size={18} /> Catat Makan Hari Ini
          </button>
        )}
      </section>

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
    </div>
  );
}
