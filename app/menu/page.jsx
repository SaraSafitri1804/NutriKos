'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Lightbulb,
  RefreshCw,
  CalendarCheck2,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  Clock,
  Flame,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import RecipeCard from '@/components/RecipeCard';
import { allowedRecipes, recommendWeekly, nutrisiDari } from '@/lib/recommend';
import { mintaAI } from '@/lib/ai';
import { getRecipe, rupiah, SLOTS, SLOT_LABEL, RECIPES, targetGizi } from '@/lib/data';

const FILTERS = ['Semua', 'Sarapan', 'Makan Siang', 'Makan Malam', 'Favorit', 'Rice Cooker', 'Kompor', '< Rp10.000', 'Tinggi Protein', 'Cepat (< 15 mnt)'];

export default function MenuPage() {
  const router = useRouter();
  const {
    profile,
    plan,
    setPlan,
    generatePlan,
    updateRecipeInPlan,
    removeRecipeFromPlan,
    addRecipeToPlan,
    setRecipePortion,
    customPlanDetails,
    logToday,
    favorit,
    ai,
    setAi,
    triggerAiModal,
    setTriggerAiModal,
    ready,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('Harian');
  const [filter, setFilter] = useState('Semua');
  const [halaman, setHalaman] = useState(1);
  const [q, setQ] = useState('');
  useEffect(() => {
    const bacaQuery = () => setQ((new URLSearchParams(window.location.search).get('q') || '').trim().toLowerCase());
    const dengarCari = (e) => setQ((e.detail || '').trim().toLowerCase());
    bacaQuery();
    window.addEventListener('popstate', bacaQuery);
    window.addEventListener('nutrikos-search', dengarCari);
    return () => {
      window.removeEventListener('popstate', bacaQuery);
      window.removeEventListener('nutrikos-search', dengarCari);
    };
  }, []);
  const [mingguan, setMingguan] = useState(null);
  const [toast, setToast] = useState('');

  // Modal States
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalTambahOpen, setModalTambahOpen] = useState(false);
  const [modalHapusOpen, setModalHapusOpen] = useState(false);
  const [modalAIOpen, setModalAIOpen] = useState(false);
  const [resepAktif, setResepAktif] = useState(null);

  // Auto trigger AI modal if redirected from Beranda
  useEffect(() => {
    if (triggerAiModal) {
      setModalAIOpen(true);
      setTriggerAiModal?.(false);
    }
  }, [triggerAiModal, setTriggerAiModal]);

  // Form edit menu
  const [resepPenggantiId, setResepPenggantiId] = useState('');
  const [porsiDipilih, setPorsiDipilih] = useState(1);
  const [filterModal, setFilterModal] = useState('Semua');

  const showToast = (pesan) => {
    setToast(pesan);
    setTimeout(() => setToast(''), 3000);
  };

  const semua = useMemo(() => allowedRecipes(profile), [profile]);

  useEffect(() => {
    setHalaman(1);
  }, [filter, q]);

  // Filter resep
  const cocokFilter = (r, f) => {
    if (f === 'Sarapan') return r.slot === 'pagi';
    if (f === 'Makan Siang') return r.slot === 'siang';
    if (f === 'Makan Malam') return r.slot === 'malam';
    if (f === 'Favorit') return favorit.includes(r.id);
    if (f === 'Rice Cooker' || f === 'Kompor') return r.alat.includes(f);
    if (f === '< Rp10.000') return r.harga < 10000;
    if (f === 'Tinggi Protein') return r.protein >= 18;
    if (f === 'Cepat (< 15 mnt)') return r.waktu < 15;
    return true;
  };

  // Kalkulasi total biaya & nutrisi dengan porsi
  const nutrisiHarian = nutrisiDari(plan, customPlanDetails);
  const total = nutrisiHarian.biaya;
  const hemat = Math.max(0, Math.round((1 - total / profile.budget) * 100));

  // Pilihan resep lain untuk filter di halaman (pencarian mencari nama, bahan, dan waktu makan)
  const cocokCari = (r) =>
    !q ||
    r.nama.toLowerCase().includes(q) ||
    (SLOT_LABEL[r.slot] || '').toLowerCase().includes(q) ||
    r.bahan.some((b) => b.nama.toLowerCase().includes(q) || b.kunci.toLowerCase().includes(q));
  const pilihan = semua.filter((r) => cocokFilter(r, filter) && (q ? cocokCari(r) : !plan.includes(r.id)));
  const PER_HALAMAN = 6;
  const totalHalaman = Math.max(1, Math.ceil(pilihan.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const pilihanTampil = pilihan.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);

  // AI Recommendation
  const tanyaAI = async () => {
    setLoading(true);
    const hasil = await mintaAI('menu', profile);
    if (hasil && hasil.ids?.length) {
      setPlan(hasil.ids);
      setAi({ alasan: hasil.alasan, sumber: hasil.sumber });
      setModalAIOpen(true);
      showToast('✨ Rekomendasi AI berhasil dibuat!');
    } else {
      generatePlan();
      setAi({
        alasan: 'Paket menu seimbang ini disusun pas dengan target bujetmu, ketersediaan alat kos, dan pantangan makanmu agar nutrisi harian optimal.',
        sumber: 'aturan',
      });
      setModalAIOpen(true);
      showToast('✨ Rekomendasi cerdas berhasil dibuat!');
    }
    setLoading(false);
  };

  const terapkan = () => {
    logToday();
    router.push('/gizi');
  };

  // Handler Buka Modal Edit
  const bukaModalEdit = (recipe) => {
    setResepAktif(recipe);
    setResepPenggantiId(recipe.id);
    const porsiSaatIni = customPlanDetails[recipe.id]?.porsi || 1;
    setPorsiDipilih(porsiSaatIni);
    setFilterModal('Semua');
    setModalEditOpen(true);
  };

  // Simpan Perubahan Edit Menu
  const simpanEditMenu = () => {
    if (!resepAktif) return;

    // Jika ganti resep
    if (resepPenggantiId && resepPenggantiId !== resepAktif.id) {
      updateRecipeInPlan(resepAktif.id, resepPenggantiId);
      setRecipePortion(resepPenggantiId, porsiDipilih);
      const namaPengganti = getRecipe(resepPenggantiId)?.nama || 'Menu Baru';
      showToast(`✓ Menu diganti menjadi "${namaPengganti}"!`);
    } else {
      // Hanya ubah porsi
      setRecipePortion(resepAktif.id, porsiDipilih);
      showToast(`✓ Porsi "${resepAktif.nama}" diatur ke ${porsiDipilih}x!`);
    }

    setModalEditOpen(false);
    setResepAktif(null);
  };

  // Handler Buka Modal Hapus
  const bukaModalHapus = (recipe) => {
    setResepAktif(recipe);
    setModalHapusOpen(true);
  };

  const konfirmasiHapusMenu = () => {
    if (!resepAktif) return;
    removeRecipeFromPlan(resepAktif.id);
    setModalHapusOpen(false);
    showToast(`Menu "${resepAktif.nama}" dihapus dari jadwal makan.`);
    setResepAktif(null);
  };

  // Handler Tambah Menu Baru
  const tambahMenuLangsung = (resepId) => {
    addRecipeToPlan(resepId);
    setModalTambahOpen(false);
    const namaResep = getRecipe(resepId)?.nama;
    showToast(`✓ "${namaResep}" ditambahkan ke jadwal harian!`);
  };

  // Daftar kandidat resep untuk modal edit (diutamakan slot sama atau semua yang cocok)
  const kandidatResep = useMemo(() => {
    if (!resepAktif) return semua;
    return semua.filter((r) => cocokFilter(r, filterModal));
  }, [semua, resepAktif, filterModal]);

  const planTampil = useMemo(() => {
    const list = plan.map((id) => getRecipe(id)).filter(Boolean);
    if (filter === 'Semua') return list;
    return list.filter((r) => cocokFilter(r, filter));
  }, [plan, filter]);

  if (!ready) return null;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-brand-deeper px-4 py-3 text-sm font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} className="text-brand-mint" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">Rekomendasi Menu</h1>
          <p className="mt-1 text-slate-600 sm:text-lg">
            Pilihan menu cerdas, hemat, dan dapat disesuaikan langsung dengan bujet kosmu.
          </p>
        </div>

        {/* Mode Toggle Harian / Mingguan */}
        <div className="flex rounded-full bg-slate-200 p-1 self-start sm:self-auto shrink-0">
          {['Harian', 'Mingguan'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'Mingguan' && !mingguan) setMingguan(recommendWeekly(profile));
              }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                mode === m ? 'bg-brand-dark text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'Harian' ? (
        <>
          {/* Quick Filter Horizontal */}
          <div className="w-full max-w-full overflow-x-auto flex gap-2 pb-2 sm:flex-wrap scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`chip shrink-0 cursor-pointer transition-all ${filter === f ? 'chip-on shadow-xs font-bold' : 'bg-white hover:bg-slate-100 text-slate-700'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Target hari ini */}
          <div className="card flex flex-wrap items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark"><Lightbulb size={20} /></span>
            <div className="min-w-0 flex-1 text-xs sm:text-sm">
              <b>Target Hari Ini:</b> Bujet <b className="text-brand-dark">{rupiah(profile.budget)}</b>
              <span className="mx-1.5 text-slate-300">•</span>Target harian <b>{targetGizi(profile).kalori.toLocaleString('id-ID')} kkal</b>
              <span className="mx-1.5 text-slate-300">•</span>Menu terpilih <b>{rupiah(total)}</b> ({nutrisiHarian.kalori} kkal, protein {nutrisiHarian.protein}g)
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${total <= profile.budget ? 'bg-success-light text-success-dark' : 'bg-red-100 text-red-700'}`}>
              {total <= profile.budget ? `Hemat ${hemat}%` : 'Melebihi Bujet'}
            </span>
          </div>

          {/* Section: Paket Menu Rekomendasi Terpilih */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Paket Menu Rekomendasi</h2>
                <p className="text-xs text-slate-500">
                  Klik tombol <b>Edit (pensil)</b> untuk mengganti resep atau mengubah porsi menu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setModalTambahOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-light px-3 py-2 text-xs font-bold text-brand-dark hover:bg-brand-mint transition-colors"
                >
                  <Plus size={15} /> Tambah Menu
                </button>
                <button
                  onClick={tanyaAI}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-accent hover:bg-amber-100 transition-colors disabled:opacity-60"
                >
                  <Sparkles size={14} /> {loading ? 'Menyusun...' : 'Rekomendasi AI'}
                </button>
                <button
                  onClick={() => {
                    generatePlan();
                    setAi(null);
                    showToast('✓ Menu berhasil diacak ulang!');
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw size={14} /> Acak Ulang
                </button>
              </div>
            </div>

            {/* AI Explanation Banner */}
            {ai && (
              <div className="rounded-2xl border border-brand-mint bg-brand-light/60 p-3.5 text-sm flex items-start gap-2.5">
                <Sparkles size={18} className="text-brand-dark shrink-0 mt-0.5" />
                <div>
                  <span
                    className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      ai.sumber === 'ai' ? 'bg-brand-dark text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {ai.sumber === 'ai' ? 'Saran AI' : 'Mode Aturan'}
                  </span>
                  <span className="text-slate-800">{ai.alasan}</span>
                </div>
              </div>
            )}

            {/* Grid Kartu Menu Rekomendasi */}
            {plan.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-sm text-slate-600 mb-3">Belum ada menu yang dipilih untuk jadwal hari ini.</p>
                <button onClick={generatePlan} className="btn btn-primary">
                  <Sparkles size={16} /> Buat Rekomendasi Menu
                </button>
              </div>
            ) : planTampil.length === 0 ? (
              <div className="card text-center py-8 text-sm text-slate-600">
                <p>Tidak ada menu terpilih hari ini untuk kategori <b>{filter}</b>.</p>
                <button
                  type="button"
                  onClick={() => setFilter('Semua')}
                  className="mt-2 text-xs font-bold text-brand-dark underline"
                >
                  Tampilkan Semua Menu Terpilih (3 Menu)
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {planTampil.map((r) => {
                  const porsi = customPlanDetails[r.id]?.porsi || 1;
                  return (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      terpilih
                      porsi={porsi}
                      onEdit={() => bukaModalEdit(r)}
                      onDelete={() => bukaModalHapus(r)}
                    />
                  );
                })}
              </div>
            )}

            {/* Ringkasan Estimasi Menu Terpilih (Inline Rapi & Tidak Mengambang Menutupi Layar) */}
            {plan.length > 0 && (
              <div className="card mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-brand-light/80 to-brand-mint/40 border border-brand-mint/60 shadow-xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white font-extrabold text-lg shadow-xs">
                    {plan.length}
                  </div>
                  <div className="min-w-0 flex-1 sm:flex-initial">
                    <div className="text-xs font-semibold text-slate-600">Estimasi Total Menu Terpilih ({plan.length} Menu)</div>
                    <div className="text-xl font-extrabold text-brand-dark">{rupiah(total)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={terapkan}
                  className="btn btn-primary w-full sm:w-auto shadow-sm"
                >
                  <CalendarCheck2 size={18} /> Terapkan ke Jadwal &amp; Lihat Gizi
                </button>
              </div>
            )}
          </div>

          {/* Section: Pilihan Menu Lainnya */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">{q ? `Hasil Pencarian "${q}"` : 'Pilihan Menu Lainnya'}</h2>
                <p className="text-xs text-slate-500">
                  {q ? `Menampilkan ${pilihan.length} resep yang cocok.` : 'Ganti menu harianmu langsung dengan opsi lezat lainnya di bawah ini.'}
                </p>
              </div>
              {q && (
                <button
                  onClick={() => { setQ(''); router.replace('/menu'); }}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-100"
                >
                  <X size={14} /> Hapus pencarian
                </button>
              )}
            </div>

            {pilihan.length === 0 ? (
              <div className="card text-sm text-slate-600">Tidak ada menu lain untuk filter ini.</div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pilihanTampil.map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      aksiLabel="Pilih Menu"
                      onAksi={() => {
                        addRecipeToPlan(r.id);
                        showToast(`✓ "${r.nama}" ditambahkan ke jadwal harian!`);
                      }}
                    />
                  ))}
                </div>

                {totalHalaman > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Halaman {halamanAman} dari {totalHalaman} ({pilihan.length} menu)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                        disabled={halamanAman === 1}
                        aria-label="Halaman sebelumnya"
                        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={15} /> Sebelumnya
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalHalaman }, (_, idx) => idx + 1).map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setHalaman(n)}
                            aria-current={n === halamanAman ? 'page' : undefined}
                            className={`h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                              n === halamanAman
                                ? 'bg-brand-dark text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
                        disabled={halamanAman === totalHalaman}
                        aria-label="Halaman berikutnya"
                        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
                      >
                        Berikutnya <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Mode Mingguan */
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(mingguan || []).map((hari, i) => {
              const tot = hari.reduce((s, id) => s + (getRecipe(id)?.harga || 0), 0);
              return (
                <div key={i} className="card border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-extrabold">
                    <span className="text-brand-dark">Hari ke-{i + 1}</span>
                    <span className="text-accent">{rupiah(tot)}</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {hari.map((id) => {
                      const r = getRecipe(id);
                      if (!r) return null;
                      return (
                        <li key={id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                          <span className="truncate pr-2">
                            {r.emoji} {r.nama}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 shrink-0">
                            {rupiah(r.harga)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-soft w-full sm:w-auto"
            onClick={() => {
              setMingguan(recommendWeekly(profile));
              showToast('✓ Rencana seminggu diacak ulang!');
            }}
          >
            <RefreshCw size={16} /> Acak Ulang Rencana Seminggu
          </button>
        </div>
      )}

      {/* MODAL 1: EDIT REKOMENDASI MENU */}
      {modalEditOpen && resepAktif && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-2xl">
                  {resepAktif.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Edit Rekomendasi Menu</h3>
                  <p className="text-xs text-slate-500">
                    Slot: <b className="text-brand-dark">{SLOT_LABEL[resepAktif.slot] || resepAktif.slot}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEditOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Info Menu Saat Ini */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-xs font-bold uppercase text-slate-500">Menu Saat Ini</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-extrabold text-base text-slate-800">{resepAktif.nama}</span>
                  <span className="font-extrabold text-accent">{rupiah(resepAktif.harga)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span>⏱️ {resepAktif.waktu} menit</span>
                  <span>• 🥩 {resepAktif.protein}g protein</span>
                  <span>• 🔥 {resepAktif.kalori} kcal</span>
                </div>
              </div>

              {/* Atur Porsi */}
              <div>
                <label className="label">Ubah Jumlah / Porsi:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPorsiDipilih(p)}
                      className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        porsiDipilih === p
                          ? 'bg-brand-dark text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p} Porsi
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-xs text-slate-500">
                  Estimasi biaya porsi ini: <b>{rupiah(resepAktif.harga * porsiDipilih)}</b> (
                  {resepAktif.protein * porsiDipilih}g protein)
                </div>
              </div>

              {/* Ganti Menu Pengganti */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Pilih Menu Pengganti:</label>
                  <span className="text-xs text-slate-500">{kandidatResep.length} pilihan resep</span>
                </div>

                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {kandidatResep.map((r) => {
                    const isSelected = resepPenggantiId === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setResepPenggantiId(r.id)}
                        className={`w-full flex items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-brand-dark bg-brand-light/40 ring-2 ring-brand-mint'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl">{r.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-800 truncate">{r.nama}</div>
                            <div className="text-[11px] text-slate-500">
                              {r.protein}g protein • {r.waktu} mnt
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-accent">{rupiah(r.harga)}</div>
                          {isSelected && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-dark">
                              <Check size={12} /> Terpilih
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Bahan Menu yang Dipilih */}
              {(() => {
                const terpilih = getRecipe(resepPenggantiId) || resepAktif;
                return (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs">
                    <div className="font-bold text-slate-700 mb-1">
                      Bahan untuk {terpilih.nama} ({porsiDipilih} porsi):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {terpilih.bahan.map((b) => (
                        <span
                          key={b.nama}
                          className="rounded-md bg-white border border-slate-200 px-2 py-1 text-slate-600"
                        >
                          {b.nama} ({b.qty})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="btn btn-soft flex-1"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={simpanEditMenu}
                  className="btn btn-primary flex-1 shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH MENU KE JADWAL */}
      {modalTambahOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalTambahOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Tambah Menu ke Jadwal</h3>
                  <p className="text-xs text-slate-500">Pilih resep yang ingin kamu santap hari ini</p>
                </div>
              </div>
              <button
                onClick={() => setModalTambahOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {semua
                .filter((r) => !plan.includes(r.id))
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-mint hover:bg-brand-light/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-3xl">{r.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-800 truncate">{r.nama}</div>
                        <div className="text-xs text-slate-500">
                          {rupiah(r.harga)} • {r.protein}g protein • {SLOT_LABEL[r.slot]}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => tambahMenuLangsung(r.id)}
                      className="btn btn-primary py-2 px-3 text-xs shrink-0"
                    >
                      <Plus size={14} /> Tambahkan
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS MENU */}
      {modalHapusOpen && resepAktif && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalHapusOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-center text-lg font-extrabold text-slate-800">Hapus Menu Ini?</h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Apakah kamu yakin ingin menghapus <b className="text-slate-800">{resepAktif.nama}</b>{' '}
              dari rekomendasi menu harian? Bahan belanja terkait akan otomatis disinkronkan.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setModalHapusOpen(false)}
                className="btn btn-soft flex-1"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapusMenu}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 4: HASIL REKOMENDASI AI */}
      {modalAIOpen && ai && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalAIOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-brand-mint animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal AI */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-dark shadow-xs">
                  <Sparkles size={22} className="text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-800">Rekomendasi NutriKos AI</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ai.sumber === 'ai'
                          ? 'bg-brand-dark text-white'
                          : 'bg-brand-mint text-brand-deeper'
                      }`}
                    >
                      {ai.sumber === 'ai' ? '✨ Gemini AI' : '✓ Sistem Pakar'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Analisis cerdas menu hemat & bergizi anak kos</p>
                </div>
              </div>
              <button
                onClick={() => setModalAIOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Kotak Alasan AI */}
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-brand-light/70 to-emerald-50/60 p-4 border border-brand-mint/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-deeper uppercase mb-1">
                <Sparkles size={14} className="text-accent" /> Alasan Pilihan AI:
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">{ai.alasan}</p>
            </div>

            {/* Preview 3 Menu yang dipilih */}
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-bold uppercase text-slate-500">Menu Pilihan untuk Kamu:</div>
              {plan.map((id) => getRecipe(id)).filter(Boolean).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-mint transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl">{r.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-brand-dark">
                        {SLOT_LABEL[r.slot]}
                      </span>
                      <div className="font-bold text-sm text-slate-800 truncate">{r.nama}</div>
                      <div className="text-xs text-slate-500">{r.protein}g protein • {r.kalori} kcal</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-accent">{rupiah(r.harga)}</div>
                    <div className="text-[10px] text-slate-400">{r.waktu} mnt</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Biaya & Status Bujet */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total Biaya 3 Menu:</div>
                <div className="text-xl font-extrabold text-brand-dark">{rupiah(total)}</div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-brand-mint px-2.5 py-1 text-xs font-bold text-brand-deeper">
                  Bujet: {rupiah(profile.budget)}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {total <= profile.budget ? `Hemat ${rupiah(profile.budget - total)}` : 'Melebihi target'}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setModalAIOpen(false);
                  tanyaAI();
                }}
                disabled={loading}
                className="btn btn-soft flex-1 text-xs sm:text-sm"
              >
                <RefreshCw size={15} /> Buat Pilihan Lain
              </button>
              <button
                onClick={() => {
                  setModalAIOpen(false);
                  showToast('✓ Rekomendasi AI berhasil diterapkan ke jadwal!');
                }}
                className="btn btn-primary flex-1 text-xs sm:text-sm shadow-md"
              >
                <Check size={16} /> Terapkan Menu Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
