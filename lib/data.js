// Data contoh resep. Harga dan nilai gizi bersifat ESTIMASI.
// TODO tim: verifikasi nilai gizi ke TKPI (Kemenkes) dan harga ke warung sekitar UNUSIA.

export const KAT = {
  karbo: 'Sumber Karbohidrat',
  protein: 'Sumber Protein',
  sayur: 'Sayuran dan Buah',
  bumbu: 'Bumbu dan Pelengkap',
};

const b = (nama, kunci, qty, harga, kat) => ({ nama, kunci, qty, harga, kat });

export const SLOT_LABEL = { pagi: 'Sarapan', siang: 'Makan Siang', malam: 'Makan Malam' };
export const SLOTS = ['pagi', 'siang', 'malam'];

export const ALAT_OPTIONS = ['Rice Cooker', 'Kompor', 'Microwave', 'Air Fryer', 'Panci / Wajan Listrik'];
export const PANTANGAN_OPTIONS = ['100% Halal', 'Alergi Telur', 'Seafood', 'Kacang-kacangan', 'Laktosa / Susu', 'Vegetarian'];
// pantangan -> tag resep yang dihindari
export const PANTANGAN_TAG = {
  'Alergi Telur': 'telur',
  Seafood: 'seafood',
  'Kacang-kacangan': 'kacang',
  'Laktosa / Susu': 'susu',
  Vegetarian: 'nonveg',
};

const masak = ['Kompor', 'Panci / Wajan Listrik'];

const raw = [
  {
    id: 'oat-telur-pisang', nama: 'Oat Telur Rebus & Pisang', slot: 'pagi', emoji: '🥣', waktu: 10,
    alat: [...masak, 'Microwave'], tags: ['telur'], kalori: 300, protein: 14, serat: 5, karbo: 40,
    bahan: [b('Oat instan', 'oat', '4 sdm', 1500, 'karbo'), b('Telur ayam', 'telur', '2 butir', 3500, 'protein'), b('Pisang', 'pisang', '1 buah', 1500, 'sayur')],
    langkah: ['Rebus telur 8-10 menit lalu kupas.', 'Seduh oat dengan air panas atau masak sebentar.', 'Sajikan dengan telur dan irisan pisang.'],
  },
  {
    id: 'nasi-telur-orak-arik', nama: 'Nasi Telur Orak-arik Sayur', slot: 'pagi', emoji: '🍳', waktu: 10,
    alat: [...masak, 'Rice Cooker'], tags: ['telur'], kalori: 400, protein: 16, serat: 4, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 mangkuk', 1500, 'karbo'), b('Telur ayam', 'telur', '2 butir', 3500, 'protein'), b('Wortel', 'wortel', '1/2 buah', 500, 'sayur'), b('Daun bawang', 'daun bawang', 'iris', 500, 'sayur'), b('Bawang merah & putih', 'bawang', '2 siung', 500, 'bumbu'), b('Minyak & garam', 'garam', 'secukupnya', 500, 'bumbu')],
    langkah: ['Kocok telur dengan garam dan sedikit lada.', 'Tumis bawang sampai harum, masukkan wortel dan daun bawang.', 'Tuang telur, orak-arik sampai matang lembut.', 'Sajikan di atas nasi hangat.'],
  },
  {
    id: 'bubur-kacang-hijau', nama: 'Bubur Kacang Hijau Rice Cooker', slot: 'pagi', emoji: '🥣', waktu: 40,
    alat: ['Rice Cooker', ...masak], tags: ['kacang'], kalori: 300, protein: 10, serat: 8, karbo: 50,
    bahan: [b('Kacang hijau', 'kacang hijau', '1/2 cup', 3000, 'protein'), b('Gula merah', 'gula', 'secukupnya', 1000, 'bumbu'), b('Santan sachet', 'santan', '1 sachet', 1500, 'bumbu')],
    langkah: ['Cuci kacang hijau, masukkan ke rice cooker dengan air.', 'Masak mode cook sampai empuk (sekitar 30 menit).', 'Tambahkan gula merah dan santan, aduk rata.'],
  },
  {
    id: 'roti-selai-pisang', nama: 'Roti Selai Pisang', slot: 'pagi', emoji: '🍞', waktu: 5,
    alat: [], tags: [], kalori: 300, protein: 6, serat: 3, karbo: 55,
    bahan: [b('Roti tawar', 'roti', '3 lembar', 2500, 'karbo'), b('Selai cokelat', 'selai', 'secukupnya', 1000, 'bumbu'), b('Pisang', 'pisang', '1 buah', 1500, 'sayur')],
    langkah: ['Oles selai di roti.', 'Tata irisan pisang di atasnya.', 'Sajikan.'],
  },
  {
    id: 'liwet-tempe-sayur-bening', nama: 'Nasi Liwet Tempe & Sayur Bening', slot: 'siang', emoji: '🍚', waktu: 25,
    alat: ['Rice Cooker'], tags: ['kacang'], kalori: 480, protein: 18, serat: 9, karbo: 62,
    bahan: [b('Beras', 'beras', '1 cup', 2000, 'karbo'), b('Tempe', 'tempe', '1/2 papan', 3000, 'protein'), b('Bayam', 'bayam', '1 ikat kecil', 2000, 'sayur'), b('Jagung manis', 'jagung', '1/2 buah', 1500, 'sayur'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Garam & kaldu', 'garam', 'secukupnya', 500, 'bumbu')],
    langkah: ['Masukkan beras, air, bawang, dan irisan tempe ke rice cooker.', 'Masak mode cook sampai matang.', 'Di akhir, masukkan bayam dan jagung, tutup 5 menit.', 'Aduk dan sajikan.'],
  },
  {
    id: 'nasi-goreng-kampung', nama: 'Nasi Goreng Kampung Telur & Kol', slot: 'siang', emoji: '🍛', waktu: 10,
    alat: masak, tags: ['telur'], kalori: 480, protein: 14, serat: 5, karbo: 65,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 2000, 'karbo'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Kol / Kubis', 'kol', '1/4 bulatan', 2000, 'sayur'), b('Bawang merah', 'bawang', '3 siung', 700, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu'), b('Kecap manis', 'kecap', 'secukupnya', 800, 'bumbu')],
    langkah: ['Tumis bawang dan cabai sampai harum.', 'Masukkan telur, orak-arik, lalu tambahkan kol.', 'Masukkan nasi dan kecap, aduk rata sampai matang.'],
  },
  {
    id: 'tempe-orek-bayam', nama: 'Tempe Orek & Tumis Bayam', slot: 'siang', emoji: '🥬', waktu: 15,
    alat: masak, tags: ['kacang'], kalori: 450, protein: 20, serat: 8, karbo: 55,
    bahan: [b('Tempe', 'tempe', '1/2 papan', 3000, 'protein'), b('Bayam', 'bayam', '1 ikat kecil', 2000, 'sayur'), b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Kecap manis', 'kecap', 'secukupnya', 1000, 'bumbu'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '2 buah', 500, 'bumbu')],
    langkah: ['Potong tempe dadu, goreng sebentar.', 'Tumis bumbu, masukkan tempe dan kecap sampai meresap.', 'Tumis bayam terpisah sebentar, sajikan dengan nasi.'],
  },
  {
    id: 'nasi-teri-kangkung', nama: 'Nasi Ikan Teri & Tumis Kangkung', slot: 'siang', emoji: '🐟', waktu: 15,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 420, protein: 17, serat: 6, karbo: 58,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Ikan teri', 'teri', '1 genggam', 3000, 'protein'), b('Kangkung', 'kangkung', '1 ikat', 2000, 'sayur'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu')],
    langkah: ['Goreng teri sampai garing.', 'Tumis bawang dan cabai, masukkan kangkung.', 'Sajikan dengan nasi hangat.'],
  },
  {
    id: 'tumis-tahu-tauge', nama: 'Tumis Tahu Tauge Kecap', slot: 'malam', emoji: '🥢', waktu: 12,
    alat: masak, tags: ['kacang'], kalori: 360, protein: 19, serat: 6, karbo: 52,
    bahan: [b('Tahu putih', 'tahu', '4 potong', 2500, 'protein'), b('Tauge', 'tauge', '1 genggam', 1500, 'sayur'), b('Nasi putih', 'nasi', '1 mangkuk', 1500, 'karbo'), b('Kecap manis', 'kecap', 'secukupnya', 1000, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 1000, 'bumbu'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Potong tahu, goreng setengah matang.', 'Tumis bawang dan cabai, masukkan tahu dan kecap.', 'Tambahkan tauge, aduk sebentar, sajikan dengan nasi.'],
  },
  {
    id: 'sup-ayam-jagung', nama: 'Sup Ayam Jagung Telur', slot: 'malam', emoji: '🍲', waktu: 20,
    alat: ['Rice Cooker', ...masak], tags: ['telur', 'nonveg'], kalori: 380, protein: 26, serat: 5, karbo: 30,
    bahan: [b('Ayam', 'ayam', '100 g', 5000, 'protein'), b('Jagung manis', 'jagung', '1/2 buah', 1500, 'sayur'), b('Wortel', 'wortel', '1/2 buah', 1000, 'sayur'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Garam & kaldu', 'garam', 'secukupnya', 500, 'bumbu')],
    langkah: ['Rebus ayam dengan bawang sampai empuk.', 'Masukkan wortel dan jagung, masak sampai lunak.', 'Tuang telur kocok perlahan sambil diaduk.'],
  },
  {
    id: 'mi-rebus-sayur-telur', nama: 'Mi Rebus Sayur & Telur', slot: 'malam', emoji: '🍜', waktu: 10,
    alat: masak, tags: ['telur'], kalori: 420, protein: 13, serat: 3, karbo: 56,
    bahan: [b('Mi instan', 'mi', '1 bungkus', 3000, 'karbo'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Sawi', 'sawi', '1 ikat kecil', 1500, 'sayur'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu')],
    langkah: ['Rebus mi sampai setengah matang.', 'Masukkan sawi dan telur, masak sampai matang.', 'Tambahkan bumbu dan cabai.'],
  },
  {
    id: 'tumis-kangkung-telur', nama: 'Nasi Telur Dadar & Tumis Kangkung', slot: 'malam', emoji: '🍳', waktu: 15,
    alat: masak, tags: ['telur'], kalori: 430, protein: 14, serat: 6, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Kangkung', 'kangkung', '1 ikat', 2000, 'sayur'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu')],
    langkah: ['Kocok telur dan dadar tipis.', 'Tumis bawang, cabai, dan kangkung.', 'Sajikan dengan nasi.'],
  },
];

export const RECIPES = raw.map((r) => ({ ...r, harga: r.bahan.reduce((s, x) => s + x.harga, 0) }));
export const getRecipe = (id) => RECIPES.find((r) => r.id === id);

export const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// Target gizi harian: AKG 2019 (Permenkes 28/2019), usia 19-29 tahun.
export const AKG = {
  'Laki-laki': { kalori: 2650, protein: 65, karbo: 430, lemak: 75, serat: 37 },
  Perempuan: { kalori: 2250, protein: 60, karbo: 360, lemak: 65, serat: 32 },
};
export const targetGizi = (profile) => AKG[profile?.jenisKelamin] || AKG.Perempuan;
export const TARGET_HARIAN = AKG.Perempuan;

export const DEFAULT_PROFILE = {
  nama: 'Rina Anggraini',
  email: '',
  kampus: 'Universitas Nahdlatul Ulama Indonesia (UNUSIA)',
  prodi: 'Teknik Informatika',
  semester: '5',
  avatar: '👩‍🎓',
  jenisKelamin: 'Perempuan',
  budget: 30000,
  alat: ['Rice Cooker', 'Kompor'],
  pantangan: ['100% Halal'],
  lokasi: 'Dekat UNUSIA, Kab. Bogor',
  stok: ['Telur', 'Nasi', 'Bawang merah', 'Tempe', 'Kol'],
};

export const AVATARS = ['👩‍🎓', '🧑‍🎓', '👨‍🎓', '🧕', '😊', '🧑‍🍳'];
