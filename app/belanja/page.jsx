'use client';
import { useState, useMemo } from 'react';
import {
  Share2,
  ShoppingCart,
  Check,
  Plus,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/components/AppProvider';
import { KAT, rupiah } from '@/lib/data';

const KATEGORI_KEYS = ['karbo', 'protein', 'sayur', 'bumbu'];

export default function BelanjaPage() {
  const {
    profile,
    getShoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleChecked,
    markAllShoppingBought,
    unmarkAllShoppingBought,
    checked,
    ready,
  } = useApp();

  // State local modal
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalTambahOpen, setModalTambahOpen] = useState(false);
  const [modalHapusOpen, setModalHapusOpen] = useState(false);
  const [itemAktif, setItemAktif] = useState(null);
  const [toast, setToast] = useState('');

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formHarga, setFormHarga] = useState('');
  const [formKat, setFormKat] = useState('sayur');
  const [formError, setFormError] = useState('');

  // Ambil daftar barang belanja terkini
  const items = useMemo(() => (ready && getShoppingItems ? getShoppingItems() : []), [ready, getShoppingItems]);

  // Kelompokkan per kategori yang teratur
  const grupKategori = useMemo(() => {
    return KATEGORI_KEYS.map((k) => ({
      key: k,
      label: KAT[k] || k,
      list: items.filter((x) => x.kat === k),
    }));
  }, [items]);

  if (!ready) return null;

  const showToast = (pesan) => {
    setToast(pesan);
    setTimeout(() => setToast(''), 3000);
  };

  // Filter & kalkulasi
  const perluBeli = items.filter((x) => !x.sudahAda);
  const sudahAda = items.filter((x) => x.sudahAda);
  const totalBarang = items.length;

  const estimasiTotal = perluBeli.reduce((s, x) => s + (Number(x.harga) || 0), 0);
  const terbeliTotal = perluBeli
    .filter((x) => checked[x.nama])
    .reduce((s, x) => s + (Number(x.harga) || 0), 0);
  const jumlahTerbeli = perluBeli.filter((x) => checked[x.nama]).length;

  const persenBudget = Math.min(100, Math.round((estimasiTotal / profile.budget) * 100));
  const persenBeli = perluBeli.length
    ? Math.round((jumlahTerbeli / perluBeli.length) * 100)
    : 100;
  const sisaBujet = profile.budget - estimasiTotal;

  // Handler Buka Modal Edit
  const bukaModalEdit = (item) => {
    setItemAktif(item);
    setFormNama(item.nama);
    setFormQty(item.qty || '');
    setFormHarga(String(item.harga || 0));
    setFormKat(item.kat || 'sayur');
    setFormError('');
    setModalEditOpen(true);
  };

  // Handler Simpan Edit
  const simpanEdit = (e) => {
    e?.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama bahan tidak boleh kosong.');
      return;
    }
    const hargaNum = Number(formHarga);
    if (isNaN(hargaNum) || hargaNum < 0) {
      setFormError('Harga harus berupa angka positif.');
      return;
    }

    updateShoppingItem(itemAktif, {
      nama: formNama.trim(),
      qty: formQty.trim() || '1 porsi',
      harga: Math.round(hargaNum),
      kat: formKat,
    });

    setModalEditOpen(false);
    setItemAktif(null);
    showToast(`✓ Perubahan "${formNama.trim()}" berhasil disimpan!`);
  };

  // Handler Buka Modal Tambah
  const bukaModalTambah = () => {
    setFormNama('');
    setFormQty('');
    setFormHarga('');
    setFormKat('sayur');
    setFormError('');
    setModalTambahOpen(true);
  };

  // Handler Simpan Tambah
  const simpanTambah = (e) => {
    e?.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama bahan tidak boleh kosong.');
      return;
    }
    const hargaNum = Number(formHarga);
    if (isNaN(hargaNum) || hargaNum < 0) {
      setFormError('Harga harus berupa angka positif.');
      return;
    }

    addShoppingItem({
      nama: formNama.trim(),
      qty: formQty.trim() || '1 porsi',
      harga: Math.round(hargaNum),
      kat: formKat,
      untuk: 'Tambahan Manual',
    });

    setModalTambahOpen(false);
    showToast(`✓ "${formNama.trim()}" berhasil ditambahkan ke daftar belanja!`);
  };

  // Handler Hapus Item
  const bukaModalHapus = (item) => {
    setItemAktif(item);
    setModalHapusOpen(true);
  };

  const konfirmasiHapus = () => {
    if (!itemAktif) return;
    deleteShoppingItem(itemAktif);
    setModalHapusOpen(false);
    showToast(`Bahan "${itemAktif.nama}" telah dihapus.`);
    setItemAktif(null);
  };

  // Bagikan ke WA / Clipboard
  const bagikan = async () => {
    const teks =
      '🛒 *Daftar Belanja NutriKos*\n' +
      perluBeli
        .map((x) => {
          const status = checked[x.nama] ? '✅' : '◻️';
          return `${status} ${x.nama} (${x.qty}) - ${rupiah(x.harga)}`;
        })
        .join('\n') +
      `\n\n💰 *Total Estimasi:* ${rupiah(estimasiTotal)} (Bujet: ${rupiah(profile.budget)})`;

    try {
      if (navigator.share) {
        await navigator.share({ text: teks });
      } else {
        await navigator.clipboard.writeText(teks);
        showToast('✓ Daftar belanja disalin ke clipboard.');
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-brand-deeper px-4 py-3 text-sm font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} className="text-brand-mint" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">Daftar Belanja Kos</h1>
            <span className="rounded-full bg-brand-mint px-2.5 py-0.5 text-xs font-bold text-brand-deeper">
              {perluBeli.length} Bahan Perlu Dibeli
            </span>
          </div>
          <p className="mt-1 text-slate-600 sm:text-lg">
            Bahan masak yang disinkronkan otomatis dari rekomendasi menu dan tambahanmu.
          </p>
        </div>

        {/* Action Button: Tambah Barang */}
        <button
          onClick={bukaModalTambah}
          className="btn btn-primary shadow-sm hover:shadow self-start sm:self-auto shrink-0"
        >
          <Plus size={18} /> Tambah Barang Belanja
        </button>
      </div>

      {/* Badge Ringkasan Cepat */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-slate-200 px-3 py-1.5 text-slate-700">
          Total {totalBarang} Item Bahan
        </span>
        <span className="rounded-full bg-brand-light px-3 py-1.5 text-brand-dark">
          {jumlahTerbeli} dari {perluBeli.length} Perlu Dibeli Sudah Dicatat
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
          {sudahAda.length} Sudah Ada di Kos
        </span>
        <span className="rounded-full bg-accent-light px-3 py-1.5 text-amber-900">
          Rekomendasi: Belanja di Warung / Pasar Subuh
        </span>
      </div>

      {/* 2. Ringkasan Anggaran (Budget Card) */}
      <section className="card border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pb-4 border-b border-slate-100">
          {/* Card 1: Total Estimasi */}
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="text-xs font-bold uppercase text-slate-500">Estimasi Belanja</div>
            <div className="mt-1 text-2xl font-extrabold text-brand-dark">
              {rupiah(estimasiTotal)}
            </div>
            <div className="text-xs text-slate-500">Target bujet: {rupiah(profile.budget)}</div>
          </div>

          {/* Card 2: Sudah Dibeli */}
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="text-xs font-bold uppercase text-slate-500">Sudah Dibeli</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-800">
              {rupiah(terbeliTotal)}
            </div>
            <div className="text-xs text-brand-dark font-medium">
              {jumlahTerbeli} dari {perluBeli.length} bahan selesai
            </div>
          </div>

          {/* Card 3: Sisa Anggaran */}
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="text-xs font-bold uppercase text-slate-500">Status Bujet</div>
            <div
              className={`mt-1 text-2xl font-extrabold ${
                sisaBujet < 0 ? 'text-red-600' : 'text-brand-dark'
              }`}
            >
              {sisaBujet < 0 ? `-${rupiah(Math.abs(sisaBujet))}` : rupiah(sisaBujet)}
            </div>
            <div className="text-xs font-semibold">
              {sisaBujet >= 0 ? (
                <span className="text-brand-dark">Hemat {rupiah(sisaBujet)}</span>
              ) : (
                <span className="text-red-600">Melebihi bujet</span>
              )}
            </div>
          </div>

          {/* Card 4: Progres Checklist */}
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="text-xs font-bold uppercase text-slate-500">Progres Belanja</div>
            <div className="mt-1 text-2xl font-extrabold text-accent">{persenBeli}%</div>
            <div className="text-xs text-slate-500">Persentase barang terbeli</div>
          </div>
        </div>

        {/* Progress Bar Dual Info */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Alokasi Bujet Terpakai: {persenBudget}%</span>
            <span>{estimasiTotal > profile.budget ? '⚠️ Melebihi target' : '✓ Dalam target'}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                estimasiTotal > profile.budget ? 'bg-red-500' : 'bg-brand-dark'
              }`}
              style={{ width: `${Math.min(100, persenBudget)}%` }}
            />
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => markAllShoppingBought(perluBeli)}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-light px-2.5 py-1.5 font-bold text-brand-dark hover:bg-brand-mint/60 transition-colors"
            >
              <Check size={14} /> Tandai Semua Sudah Dibeli
            </button>
            <button
              onClick={() => unmarkAllShoppingBought(perluBeli)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={14} /> Reset Status Belanja
            </button>
          </div>
          <button
            onClick={bagikan}
            className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-brand-dark transition-colors"
          >
            <Share2 size={15} /> Bagikan Daftar Belanja
          </button>
        </div>
      </section>

      {/* 3 & 4. Grid Kategori Bahan */}
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Daftar Belanja Masih Kosong</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Pilih rekomendasi menu di halaman menu untuk memasukkan bahan secara otomatis, atau
            tambahkan barang manual menggunakan tombol di atas.
          </p>
          <button onClick={bukaModalTambah} className="btn btn-primary mt-4">
            <Plus size={16} /> Tambah Barang Manual
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {grupKategori.map((grup) => {
            if (grup.list.length === 0) return null;
            const subtotalGrup = grup.list
              .filter((x) => !x.sudahAda)
              .reduce((s, x) => s + (Number(x.harga) || 0), 0);

            return (
              <section
                key={grup.key}
                className="card border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand-dark text-sm font-extrabold">
                        {grup.key === 'karbo' && '🍚'}
                        {grup.key === 'protein' && '🥩'}
                        {grup.key === 'sayur' && '🥬'}
                        {grup.key === 'bumbu' && '🧂'}
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-800">{grup.label}</h2>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {grup.list.length} bahan terdaftar
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase text-slate-400">Subtotal</div>
                      <div className="text-sm font-extrabold text-accent">
                        {rupiah(subtotalGrup)}
                      </div>
                    </div>
                  </div>

                  {/* List of items */}
                  <div className="space-y-2.5">
                    {grup.list.map((item) => {
                      const isDibeli = item.sudahAda || checked[item.nama];

                      return (
                        <div
                          key={item.id || item.nama}
                          className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                            isDibeli
                              ? 'bg-slate-50/70 border-slate-200 opacity-60'
                              : 'bg-white border-slate-200/90 hover:border-brand-mint hover:shadow-xs'
                          }`}
                        >
                          {/* Checkbox / Toggle Status Dibeli */}
                          <button
                            type="button"
                            disabled={item.sudahAda}
                            onClick={() => toggleChecked(item.nama)}
                            aria-label={
                              item.sudahAda
                                ? 'Sudah ada di kos'
                                : isDibeli
                                ? 'Batalkan status sudah dibeli'
                                : 'Tandai sudah dibeli'
                            }
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              item.sudahAda
                                ? 'bg-slate-300 text-slate-600 cursor-default'
                                : isDibeli
                                ? 'bg-brand-dark text-white'
                                : 'border-2 border-slate-300 hover:border-brand-dark'
                            }`}
                          >
                            {(isDibeli || item.sudahAda) && <Check size={14} />}
                          </button>

                          {/* Detail Nama & Takaran */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold text-sm leading-tight text-slate-800 ${
                                  isDibeli ? 'line-through text-slate-500' : ''
                                }`}
                              >
                                {item.nama}
                              </span>
                              {item.isCustom && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                                  Manual
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-600">{item.qty}</span>
                              {item.sudahAda ? (
                                <span className="text-brand-dark font-medium"> • Tersedia di kos</span>
                              ) : (
                                <span> • {item.untuk || 'Kebutuhan Dapur'}</span>
                              )}
                            </div>
                          </div>

                          {/* Harga & Status */}
                          <div className="text-right shrink-0">
                            <div
                              className={`text-sm font-extrabold ${
                                isDibeli ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {item.sudahAda ? 'Stok Kos' : rupiah(item.harga)}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400">
                              {item.sudahAda ? 'Rp 0' : isDibeli ? 'Sudah dibeli' : 'Perlu dibeli'}
                            </div>
                          </div>

                          {/* Action Buttons: Edit & Hapus */}
                          <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-100">
                            <button
                              type="button"
                              onClick={() => bukaModalEdit(item)}
                              title="Edit item ini"
                              aria-label={`Edit ${item.nama}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => bukaModalHapus(item)}
                              title="Hapus dari daftar belanja"
                              aria-label={`Hapus ${item.nama}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* MODAL 1: EDIT ITEM BELANJA */}
      {modalEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Edit Item Belanja</h3>
                  <p className="text-xs text-slate-500">Sesuaikan takaran, harga, atau kategori</p>
                </div>
              </div>
              <button
                onClick={() => setModalEditOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={simpanEdit} className="mt-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="label" htmlFor="edit-nama">
                  Nama Bahan
                </label>
                <input
                  id="edit-nama"
                  className="input"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Telur ayam"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="edit-qty">
                    Jumlah / Takaran
                  </label>
                  <input
                    id="edit-qty"
                    className="input"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    placeholder="Contoh: 2 butir"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="edit-harga">
                    Estimasi Harga (Rp)
                  </label>
                  <input
                    id="edit-harga"
                    type="number"
                    min="0"
                    step="500"
                    className="input"
                    value={formHarga}
                    onChange={(e) => setFormHarga(e.target.value)}
                    placeholder="Contoh: 3500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="edit-kat">
                  Kategori Bahan
                </label>
                <select
                  id="edit-kat"
                  className="input"
                  value={formKat}
                  onChange={(e) => setFormKat(e.target.value)}
                >
                  <option value="karbo">Sumber Karbohidrat</option>
                  <option value="protein">Sumber Protein</option>
                  <option value="sayur">Sayuran dan Buah</option>
                  <option value="bumbu">Bumbu dan Pelengkap</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="btn btn-soft flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH BARANG BARU */}
      {modalTambahOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalTambahOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Tambah Barang Belanja</h3>
                  <p className="text-xs text-slate-500">
                    Masukkan bahan tambahan di luar menu otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalTambahOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={simpanTambah} className="mt-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="label" htmlFor="tambah-nama">
                  Nama Bahan
                </label>
                <input
                  id="tambah-nama"
                  className="input"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Susu UHT 200ml / Buah Apel"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="tambah-qty">
                    Jumlah / Takaran
                  </label>
                  <input
                    id="tambah-qty"
                    className="input"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    placeholder="Contoh: 1 kotak / 2 buah"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="tambah-harga">
                    Estimasi Harga (Rp)
                  </label>
                  <input
                    id="tambah-harga"
                    type="number"
                    min="0"
                    step="500"
                    className="input"
                    value={formHarga}
                    onChange={(e) => setFormHarga(e.target.value)}
                    placeholder="Contoh: 6000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="tambah-kat">
                  Kategori Bahan
                </label>
                <select
                  id="tambah-kat"
                  className="input"
                  value={formKat}
                  onChange={(e) => setFormKat(e.target.value)}
                >
                  <option value="sayur">Sayuran dan Buah</option>
                  <option value="protein">Sumber Protein</option>
                  <option value="karbo">Sumber Karbohidrat</option>
                  <option value="bumbu">Bumbu dan Pelengkap</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTambahOpen(false)}
                  className="btn btn-soft flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Tambahkan ke Belanja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS */}
      {modalHapusOpen && itemAktif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalHapusOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-center text-lg font-extrabold text-slate-800">
              Hapus Barang Belanja?
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Apakah kamu yakin ingin menghapus <b className="text-slate-800">{itemAktif.nama}</b>{' '}
              dari daftar belanjaan kos?
            </p>
            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setModalHapusOpen(false)}
                className="btn btn-soft flex-1"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapus}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
