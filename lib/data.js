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
  {
    id: 'telur-ceplok-kecap', nama: 'Nasi Telur Ceplok Kecap Bawang', slot: 'pagi', emoji: '🍳', waktu: 8,
    alat: ['Rice Cooker', ...masak], tags: ['telur'], kalori: 370, protein: 13, serat: 2, karbo: 48,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Telur ayam', 'telur', '2 butir', 3500, 'protein'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '2 buah', 500, 'bumbu'), b('Kecap manis', 'kecap', '1 sdm', 700, 'bumbu')],
    langkah: ['Ceplok telur sampai matang sesuai selera.', 'Tumis irisan bawang dan cabai, tuang kecap dan sedikit air.', 'Siram di atas telur dan sajikan bersama nasi hangat.'],
  },
  {
    id: 'roti-telur-keju', nama: 'Roti Panggang Telur & Keju', slot: 'pagi', emoji: '🥪', waktu: 10,
    alat: [...masak, 'Air Fryer', 'Microwave'], tags: ['telur', 'susu'], kalori: 380, protein: 15, serat: 2, karbo: 42,
    bahan: [b('Roti tawar', 'roti', '2 lembar', 2000, 'karbo'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Keju slice', 'keju', '1 lembar', 2500, 'protein'), b('Margarin', 'margarin', '1 sdt', 500, 'bumbu')],
    langkah: ['Kocok telur dengan sejumput garam, goreng dadar tipis.', 'Panggang roti dengan margarin, isi dengan telur dan keju.', 'Lipat atau tumpuk, sajikan selagi hangat.'],
  },
  {
    id: 'oat-pisang-susu', nama: 'Oat Pisang Susu Praktis', slot: 'pagi', emoji: '🍌', waktu: 5,
    alat: [], tags: ['susu'], kalori: 320, protein: 10, serat: 6, karbo: 52,
    bahan: [b('Oat instan', 'oat', '4 sdm', 1500, 'karbo'), b('Susu UHT', 'susu', '150 ml', 3500, 'protein'), b('Pisang', 'pisang', '1 buah', 1500, 'sayur')],
    langkah: ['Tuang susu ke mangkuk berisi oat, aduk rata.', 'Diamkan 3 menit sampai oat lembut.', 'Tambahkan irisan pisang di atasnya.'],
  },
  {
    id: 'ayam-kecap-rice-cooker', nama: 'Nasi Ayam Kecap Rice Cooker', slot: 'siang', emoji: '🍗', waktu: 30,
    alat: ['Rice Cooker', ...masak], tags: ['nonveg'], kalori: 520, protein: 28, serat: 3, karbo: 60,
    bahan: [b('Beras', 'beras', '1 cup', 2000, 'karbo'), b('Ayam potong', 'ayam', '100 g', 5500, 'protein'), b('Wortel', 'wortel', '1/2 buah', 1000, 'sayur'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu'), b('Kecap manis', 'kecap', '2 sdm', 1000, 'bumbu')],
    langkah: ['Lumuri ayam dengan kecap manis dan bawang putih cincang.', 'Masukkan beras, air, potongan wortel, dan ayam ke rice cooker.', 'Masak mode cook sampai matang dan harum.'],
  },
  {
    id: 'tahu-tempe-balado', nama: 'Nasi Tahu Tempe Balado', slot: 'siang', emoji: '🌶️', waktu: 15,
    alat: masak, tags: ['kacang'], kalori: 460, protein: 21, serat: 7, karbo: 56,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Tempe', 'tempe', '1/2 papan', 2500, 'protein'), b('Tahu putih', 'tahu', '3 potong', 2000, 'protein'), b('Cabai merah', 'cabai', '5 buah', 1500, 'bumbu'), b('Bawang merah', 'bawang', '3 siung', 700, 'bumbu'), b('Tomat', 'tomat', '1/2 buah', 800, 'sayur')],
    langkah: ['Goreng tahu dan tempe sampai berkulit.', 'Haluskan atau iris cabai, bawang, dan tomat lalu tumis sampai matang.', 'Masukkan tahu dan tempe, aduk rata, sajikan dengan nasi.'],
  },
  {
    id: 'capcay-kuah-tahu', nama: 'Capcay Kuah Sayur & Tahu', slot: 'siang', emoji: '🥬', waktu: 15,
    alat: masak, tags: [], kalori: 390, protein: 16, serat: 9, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Sawi hijau', 'sawi', '1 ikat', 2000, 'sayur'), b('Wortel', 'wortel', '1 buah', 1500, 'sayur'), b('Kol / Kubis', 'kol', '1/4 bulatan', 1500, 'sayur'), b('Tahu putih', 'tahu', '3 potong', 2000, 'protein'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Tumis bawang putih sampai harum, tuang air secukupnya.', 'Masukkan wortel sampai setengah empuk, lalu tambahkan sawi, kol, dan tahu.', 'Bumbui garam dan merica, masak sebentar, sajikan dengan nasi.'],
  },
  {
    id: 'telur-dadar-tahu', nama: 'Telur Dadar Tahu Sambal Kecap', slot: 'malam', emoji: '🥚', waktu: 12,
    alat: masak, tags: ['telur', 'kacang'], kalori: 410, protein: 19, serat: 3, karbo: 46,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Telur ayam', 'telur', '2 butir', 3500, 'protein'), b('Tahu putih', 'tahu', '2 potong', 1500, 'protein'), b('Daun bawang', 'daun bawang', '1 batang', 500, 'sayur'), b('Kecap & cabai', 'kecap', 'secukupnya', 1000, 'bumbu')],
    langkah: ['Haluskan tahu, campur dengan kocokan telur, daun bawang, dan garam.', 'Goreng dadar sampai matang kedua sisi.', 'Sajikan hangat dengan sambal kecap dan nasi.'],
  },
  {
    id: 'nasi-sarden-tomat', nama: 'Nasi Sarden Tumis Bawang', slot: 'malam', emoji: '🐟', waktu: 10,
    alat: ['Rice Cooker', ...masak], tags: ['seafood', 'nonveg'], kalori: 440, protein: 22, serat: 3, karbo: 52,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Sarden kaleng kecil', 'sarden', '1 kaleng', 7500, 'protein'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu')],
    langkah: ['Tumis irisan bawang merah dan cabai sampai harum.', 'Tuang sarden beserta sausnya, masak 3-5 menit sampai mendidih.', 'Sajikan bersama nasi hangat.'],
  },
  {
    id: 'bihun-goreng-sayur', nama: 'Bihun Goreng Sayur & Telur', slot: 'malam', emoji: '🍝', waktu: 15,
    alat: masak, tags: ['telur'], kalori: 430, protein: 14, serat: 5, karbo: 64,
    bahan: [b('Bihun jagung', 'bihun', '1 keping', 2500, 'karbo'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Sawi hijau', 'sawi', '1 ikat kecil', 1500, 'sayur'), b('Wortel', 'wortel', '1/2 buah', 1000, 'sayur'), b('Kecap manis', 'kecap', '1 sdm', 700, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Rendam bihun dalam air hangat sampai lunak, lalu tiriskan.', 'Tumis bawang putih, buat telur orak-arik, masukkan wortel dan sawi.', 'Masukkan bihun dan kecap manis, aduk rata hingga matang.'],
  },
  {
    id: 'yogurt-granola-apel', nama: 'Yogurt Granola & Apel', slot: 'pagi', emoji: '🥣', waktu: 5,
    alat: [], tags: ['susu', 'kacang'], kalori: 310, protein: 11, serat: 6, karbo: 44,
    bahan: [b('Yogurt plain', 'yogurt', '1 cup', 6000, 'protein'), b('Granola', 'granola', '3 sdm', 3000, 'karbo'), b('Apel', 'apel', '1 buah', 3500, 'sayur'), b('Madu', 'madu', '1 sdt', 1000, 'bumbu')],
    langkah: ['Potong dadu apel segar.', 'Tuang yogurt ke mangkuk, taburi granola dan apel.', 'Beri madu di atasnya lalu sajikan.'],
  },
  {
    id: 'roti-alpukat-telur', nama: 'Roti Panggang Alpukat & Telur', slot: 'pagi', emoji: '🥑', waktu: 10,
    alat: [...masak, 'Air Fryer'], tags: ['telur'], kalori: 390, protein: 13, serat: 7, karbo: 38,
    bahan: [b('Roti tawar', 'roti', '2 lembar', 2000, 'karbo'), b('Alpukat', 'alpukat', '1/2 buah', 5000, 'sayur'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Garam & lada', 'garam', 'secukupnya', 300, 'bumbu')],
    langkah: ['Haluskan daging alpukat dengan sedikit garam.', 'Panggang roti dan buat telur mata sapi.', 'Oles alpukat di roti lalu taruh telur di atasnya.'],
  },
  {
    id: 'ubi-panggang-madu', nama: 'Ubi Cilembu Panggang Madu', slot: 'pagi', emoji: '🍠', waktu: 25,
    alat: ['Air Fryer', 'Microwave', 'Rice Cooker'], tags: [], kalori: 320, protein: 5, serat: 7, karbo: 70,
    bahan: [b('Ubi jalar', 'ubi', '2 buah sedang', 4000, 'karbo'), b('Madu', 'madu', '1 sdm', 1500, 'bumbu'), b('Margarin', 'margarin', '1 sdt', 500, 'bumbu')],
    langkah: ['Cuci bersih ubi dan tusuk-tusuk dengan garpu.', 'Panggang di air fryer atau microwave hingga empuk.', 'Belah ubi, beri margarin dan madu.'],
  },
  {
    id: 'singkong-goreng-kunyit', nama: 'Singkong Goreng Bawang Kunyit', slot: 'pagi', emoji: '🥔', waktu: 20,
    alat: masak, tags: [], kalori: 350, protein: 4, serat: 5, karbo: 68,
    bahan: [b('Singkong', 'singkong', '250 g', 3000, 'karbo'), b('Kunyit bubuk', 'kunyit', '1/2 sdt', 500, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu'), b('Garam', 'garam', 'secukupnya', 300, 'bumbu')],
    langkah: ['Rebus singkong dengan bawang putih, kunyit, dan garam sampai empuk.', 'Tiriskan lalu goreng sebentar hingga bagian luar renyah.', 'Sajikan hangat.'],
  },
  {
    id: 'lontong-pecel-sayur', nama: 'Lontong Pecel Sayur Sederhana', slot: 'pagi', emoji: '🥗', waktu: 15,
    alat: ['Rice Cooker', ...masak], tags: ['kacang'], kalori: 410, protein: 13, serat: 8, karbo: 58,
    bahan: [b('Lontong', 'lontong', '1 buah', 3000, 'karbo'), b('Kacang panjang', 'kacang panjang', '5 lonjor', 1500, 'sayur'), b('Tauge', 'tauge', '1 genggam', 1500, 'sayur'), b('Kacang tanah sangrai', 'kacang tanah', '2 sdm', 2500, 'protein'), b('Cabai rawit', 'cabai', '2 buah', 500, 'bumbu')],
    langkah: ['Rebus kacang panjang dan tauge sebentar hingga matang.', 'Haluskan kacang tanah, cabai, dan sedikit gula garam lalu seduh air hangat.', 'Tata lontong dan sayuran, siram bumbu kacang.'],
  },
  {
    id: 'bakwan-sayur-renyah', nama: 'Bakwan Sayur & Nasi Hangat', slot: 'pagi', emoji: '🥬', waktu: 15,
    alat: masak, tags: [], kalori: 420, protein: 9, serat: 5, karbo: 62,
    bahan: [b('Tepung terigu', 'tepung terigu', '5 sdm', 1500, 'karbo'), b('Kol / Kubis', 'kol', '1 genggam', 1000, 'sayur'), b('Wortel', 'wortel', '1/2 buah', 1000, 'sayur'), b('Tauge', 'tauge', '1 genggam', 1000, 'sayur'), b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo')],
    langkah: ['Campur tepung terigu, air, garam, dan semua sayuran iris.', 'Goreng sesendok demi sesendok hingga kuning keemasan.', 'Sajikan bersama nasi hangat.'],
  },
  {
    id: 'nasi-abon-telur-selada', nama: 'Nasi Abon Telur & Selada', slot: 'pagi', emoji: '🍚', waktu: 8,
    alat: ['Rice Cooker', ...masak], tags: ['telur', 'nonveg'], kalori: 390, protein: 17, serat: 3, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Abon sapi', 'abon', '2 sdm', 4000, 'protein'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Selada', 'selada', '3 lembar', 1500, 'sayur')],
    langkah: ['Rebus atau ceplok telur sesuai selera.', 'Tata nasi hangat, daun selada segar, telur, dan taburan abon.', 'Siap disantap.'],
  },
  {
    id: 'nasi-edamame-telur', nama: 'Nasi Edamame & Telur Orak-arik', slot: 'pagi', emoji: '🫛', waktu: 12,
    alat: ['Rice Cooker', ...masak], tags: ['telur', 'kacang'], kalori: 400, protein: 20, serat: 6, karbo: 48,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Edamame kupas', 'edamame', '1/2 cup', 4000, 'protein'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Saus tiram', 'saus tiram', '1 sdt', 500, 'bumbu')],
    langkah: ['Rebus edamame sebentar hingga empuk.', 'Orak-arik telur, masukkan edamame dan saus tiram.', 'Sajikan di atas nasi hangat.'],
  },
  {
    id: 'salad-pepaya-yogurt', nama: 'Bowl Pepaya Yogurt & Oat', slot: 'pagi', emoji: '🥭', waktu: 5,
    alat: [], tags: ['susu'], kalori: 290, protein: 9, serat: 6, karbo: 46,
    bahan: [b('Pepaya potong', 'pepaya', '1 mangkuk', 3000, 'sayur'), b('Yogurt plain', 'yogurt', '1 cup', 6000, 'protein'), b('Oat instan', 'oat', '2 sdm', 1000, 'karbo')],
    langkah: ['Tata potongan pepaya segar di mangkuk.', 'Tuang yogurt dan taburi oat instan.', 'Sajikan dingin lebih nikmat.'],
  },
  {
    id: 'nasi-goreng-kornet', nama: 'Nasi Goreng Kornet Sederhana', slot: 'pagi', emoji: '🍛', waktu: 10,
    alat: masak, tags: ['nonveg'], kalori: 460, protein: 15, serat: 3, karbo: 58,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Kornet sapi', 'kornet', '2 sdm', 4500, 'protein'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu'), b('Daun bawang', 'daun bawang', '1 batang', 500, 'sayur'), b('Kecap manis', 'kecap', '1 sdm', 700, 'bumbu')],
    langkah: ['Tumis bawang putih, masukkan kornet dan aduk rata.', 'Tambahkan nasi, kecap, dan daun bawang.', 'Masak hingga harum dan panas merata.'],
  },
  {
    id: 'perkedel-kornet-kentang', nama: 'Nasi Perkedel Kentang Kornet', slot: 'siang', emoji: '🥔', waktu: 20,
    alat: [...masak, 'Air Fryer'], tags: ['telur', 'nonveg'], kalori: 470, protein: 16, serat: 4, karbo: 60,
    bahan: [b('Kentang', 'kentang', '2 buah', 4000, 'karbo'), b('Kornet sapi', 'kornet', '2 sdm', 4500, 'protein'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Rebus atau goreng kentang lalu haluskan.', 'Campur dengan kornet, bawang putih, garam, dan bentuk bulat pipih.', 'Celup ke kocokan telur lalu goreng sampai keemasan.'],
  },
  {
    id: 'jamur-tiram-crispy', nama: 'Nasi Jamur Tiram Crispy & Sambal', slot: 'siang', emoji: '🍄', waktu: 15,
    alat: [...masak, 'Air Fryer'], tags: [], kalori: 420, protein: 11, serat: 5, karbo: 62,
    bahan: [b('Jamur tiram', 'jamur tiram', '150 g', 4000, 'sayur'), b('Tepung bumbu', 'tepung bumbu', '4 sdm', 2000, 'karbo'), b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Saus sambal', 'saus sambal', '2 sdm', 800, 'bumbu')],
    langkah: ['Suwir jamur tiram, peras airnya lalu balur tepung bumbu.', 'Goreng hingga garing kecokelatan.', 'Sajikan dengan nasi hangat dan saus sambal.'],
  },
  {
    id: 'tumis-buncis-telur-puyuh', nama: 'Tumis Buncis & Telur Puyuh', slot: 'siang', emoji: '🫛', waktu: 15,
    alat: masak, tags: ['telur'], kalori: 410, protein: 16, serat: 6, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Buncis', 'buncis', '100 g', 2500, 'sayur'), b('Telur puyuh rebus', 'telur puyuh', '6 butir', 4000, 'protein'), b('Saus tiram', 'saus tiram', '1 sdm', 1000, 'bumbu'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Tumis bawang merah, masukkan irisan buncis.', 'Tambahkan telur puyuh rebus dan saus tiram.', 'Aduk rata sebentar lalu sajikan dengan nasi.'],
  },
  {
    id: 'nasi-nugget-lalap-timun', nama: 'Nasi Nugget Ayam & Lalap Timun', slot: 'siang', emoji: '🍗', waktu: 10,
    alat: [...masak, 'Air Fryer'], tags: ['nonveg'], kalori: 460, protein: 16, serat: 3, karbo: 56,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Nugget ayam', 'nugget', '4 potong', 5000, 'protein'), b('Mentimun', 'timun', '1/2 buah', 1000, 'sayur'), b('Saus sambal', 'saus sambal', '1 sdm', 500, 'bumbu')],
    langkah: ['Goreng atau air-fry nugget sampai renyah.', 'Iris mentimun sebagai lalapan segar.', 'Sajikan bersama nasi dan saus sambal.'],
  },
  {
    id: 'nasi-lele-sambal-terasi', nama: 'Nasi Lele Goreng & Sambal Terasi', slot: 'siang', emoji: '🐟', waktu: 20,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 490, protein: 24, serat: 3, karbo: 54,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Ikan lele', 'lele', '1 ekor', 6000, 'protein'), b('Mentimun', 'timun', '1/2 buah', 1000, 'sayur'), b('Cabai rawit', 'cabai', '4 buah', 800, 'bumbu'), b('Terasi bakar', 'terasi', '1/2 sdt', 500, 'bumbu'), b('Tomat', 'tomat', '1/2 buah', 800, 'sayur')],
    langkah: ['Goreng lele yang sudah dibumbui garam hingga matang garing.', 'Ulek cabai, tomat, dan terasi goreng dengan sedikit garam.', 'Sajikan lele bersama nasi, sambal, dan irisan timun.'],
  },
  {
    id: 'nasi-tongkol-suwir-serai', nama: 'Nasi Tongkol Suwir Pedas Serai', slot: 'siang', emoji: '🐟', waktu: 15,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 450, protein: 25, serat: 3, karbo: 54,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Ikan tongkol suwir', 'tongkol', '100 g', 6000, 'protein'), b('Serai', 'serai', '1 batang', 500, 'bumbu'), b('Cabai merah', 'cabai', '4 buah', 1000, 'bumbu'), b('Bawang merah', 'bawang', '3 siung', 700, 'bumbu')],
    langkah: ['Tumis bawang, cabai, dan serai memar sampai harum.', 'Masukkan tongkol suwir, aduk rata dengan sedikit garam.', 'Sajikan hangat dengan nasi putih.'],
  },
  {
    id: 'semur-hati-ayam-jahe', nama: 'Semur Hati Ayam Jahe Kecap', slot: 'siang', emoji: '🍲', waktu: 20,
    alat: ['Rice Cooker', ...masak], tags: ['nonveg'], kalori: 440, protein: 23, serat: 2, karbo: 52,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Hati ayam', 'hati ayam', '100 g', 4500, 'protein'), b('Jahe', 'jahe', '1 ruas', 500, 'bumbu'), b('Kecap manis', 'kecap', '2 sdm', 1000, 'bumbu'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Rebus sebentar hati ayam dengan jahe memar lalu tiriskan.', 'Tumis bawang, masukkan hati ayam, kecap, dan sedikit air.', 'Masak sampai bumbu meresap dan sajikan dengan nasi.'],
  },
  {
    id: 'tumis-brokoli-ayam', nama: 'Tumis Brokoli Ayam Saus Tiram', slot: 'siang', emoji: '🥦', waktu: 15,
    alat: masak, tags: ['nonveg'], kalori: 430, protein: 26, serat: 7, karbo: 48,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Brokoli', 'brokoli', '100 g', 4000, 'sayur'), b('Ayam fillet', 'ayam', '80 g', 4500, 'protein'), b('Saus tiram', 'saus tiram', '1 sdm', 1000, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Tumis bawang putih, masukkan potongan ayam hingga berubah warna.', 'Tambahkan brokoli, sedikit air, dan saus tiram.', 'Masak 3-4 menit hingga brokoli matang renyah.'],
  },
  {
    id: 'sayur-bening-labu-siam', nama: 'Sayur Bening Labu Siam & Tempe', slot: 'siang', emoji: '🍲', waktu: 15,
    alat: ['Rice Cooker', ...masak], tags: ['kacang'], kalori: 400, protein: 17, serat: 8, karbo: 54,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Labu siam', 'labu siam', '1/2 buah', 2000, 'sayur'), b('Tempe', 'tempe', '1/2 papan', 2500, 'protein'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Garam', 'garam', 'secukupnya', 300, 'bumbu')],
    langkah: ['Didihkan air bersama irisan bawang merah.', 'Masukkan potongan labu siam dan garam, masak hingga empuk.', 'Sajikan bersama tempe goreng dan nasi.'],
  },
  {
    id: 'ayam-geprek-sambal', nama: 'Nasi Ayam Tepung Geprek', slot: 'siang', emoji: '🍗', waktu: 20,
    alat: [...masak, 'Air Fryer'], tags: ['nonveg'], kalori: 520, protein: 27, serat: 3, karbo: 60,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Ayam potong', 'ayam', '100 g', 5500, 'protein'), b('Tepung bumbu', 'tepung bumbu', '3 sdm', 1500, 'karbo'), b('Cabai rawit', 'cabai', '5 buah', 1000, 'bumbu'), b('Mentimun', 'timun', '1/2 buah', 1000, 'sayur')],
    langkah: ['Balur ayam dengan tepung bumbu lalu goreng hingga krispi.', 'Ulek cabai rawit, bawang putih, dan garam, siram sedikit minyak panas.', 'Geprek ayam di atas sambal, sajikan dengan nasi dan timun.'],
  },
  {
    id: 'makaroni-sosis-saus-tomat', nama: 'Makaroni Sosis Saus Tomat', slot: 'malam', emoji: '🍝', waktu: 15,
    alat: ['Rice Cooker', ...masak], tags: ['nonveg'], kalori: 450, protein: 15, serat: 3, karbo: 62,
    bahan: [b('Makaroni', 'makaroni', '75 g', 3000, 'karbo'), b('Sosis ayam', 'sosis', '2 buah', 4000, 'protein'), b('Saus tomat', 'saus tomat', '2 sdm', 1000, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Rebus makaroni sampai empuk lalu tiriskan.', 'Tumis bawang putih dan irisan sosis.', 'Masukkan makaroni dan saus tomat, aduk rata hingga matang.'],
  },
  {
    id: 'spaghetti-aglio-sosis', nama: 'Spaghetti Pedas Sosis Bawang', slot: 'malam', emoji: '🍝', waktu: 15,
    alat: masak, tags: ['nonveg'], kalori: 460, protein: 16, serat: 3, karbo: 64,
    bahan: [b('Spaghetti', 'spaghetti', '75 g', 3500, 'karbo'), b('Sosis ayam', 'sosis', '2 buah', 4000, 'protein'), b('Bawang putih', 'bawang', '3 siung', 700, 'bumbu'), b('Saus sambal', 'saus sambal', '2 sdm', 800, 'bumbu')],
    langkah: ['Rebus spaghetti sampai al dente lalu tiriskan.', 'Tumis bawang putih cincang dan irisan sosis.', 'Masukkan spaghetti dan saus sambal, aduk rata.'],
  },
  {
    id: 'kwetiau-goreng-udang', nama: 'Kwetiau Goreng Udang & Sawi', slot: 'malam', emoji: '🍜', waktu: 15,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 470, protein: 20, serat: 4, karbo: 62,
    bahan: [b('Kwetiau basah', 'kwetiau', '150 g', 3500, 'karbo'), b('Udang kupas', 'udang', '6 ekor', 6500, 'protein'), b('Sawi hijau', 'sawi', '1 ikat kecil', 1500, 'sayur'), b('Saus tiram', 'saus tiram', '1 sdm', 1000, 'bumbu'), b('Kecap manis', 'kecap', '1 sdm', 700, 'bumbu')],
    langkah: ['Tumis bawang dan udang hingga berubah warna.', 'Masukkan sawi, kwetiau, saus tiram, dan kecap manis.', 'Aduk cepat di api besar sampai merata.'],
  },
  {
    id: 'sop-bakso-kembang-kol', nama: 'Sop Bakso & Kembang Kol Hangat', slot: 'malam', emoji: '🍲', waktu: 15,
    alat: ['Rice Cooker', ...masak], tags: ['nonveg'], kalori: 380, protein: 17, serat: 6, karbo: 46,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Bakso sapi', 'bakso', '5 butir', 5000, 'protein'), b('Kembang kol', 'kembang kol', '100 g', 3000, 'sayur'), b('Wortel', 'wortel', '1/2 buah', 1000, 'sayur'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Didihkan air bersama bawang putih geprek dan garam.', 'Masukkan wortel, kembang kol, dan irisan bakso.', 'Masak sampai sayuran empuk, sajikan dengan nasi.'],
  },
  {
    id: 'tumis-cumi-paprika', nama: 'Tumis Cumi Paprika Saus Tiram', slot: 'malam', emoji: '🦑', waktu: 15,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 410, protein: 24, serat: 4, karbo: 48,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Cumi-cumi', 'cumi', '100 g', 7500, 'protein'), b('Paprika', 'paprika', '1/2 buah', 3500, 'sayur'), b('Saus tiram', 'saus tiram', '1 sdm', 1000, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Tumis bawang putih sampai harum, masukkan cumi potong.', 'Tambahkan irisan paprika dan saus tiram.', 'Masak cepat 3 menit agar cumi tidak alot, sajikan dengan nasi.'],
  },
  {
    id: 'balado-terong-tempe', nama: 'Terong Balado & Tempe Goreng', slot: 'malam', emoji: '🍆', waktu: 15,
    alat: masak, tags: ['kacang'], kalori: 420, protein: 16, serat: 8, karbo: 56,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Terong ungu', 'terong', '1 buah', 2500, 'sayur'), b('Tempe', 'tempe', '1/2 papan', 2500, 'protein'), b('Cabai merah', 'cabai', '4 buah', 1000, 'bumbu'), b('Tomat', 'tomat', '1/2 buah', 800, 'sayur')],
    langkah: ['Potong terong dan tempe lalu goreng hingga matang.', 'Tumis cabai dan tomat halus hingga tanak.', 'Masukkan terong dan tempe, aduk rata dan sajikan dengan nasi.'],
  },
  {
    id: 'tumis-pare-teri', nama: 'Tumis Pare Ikan Teri', slot: 'malam', emoji: '🥬', waktu: 15,
    alat: masak, tags: ['seafood', 'nonveg'], kalori: 380, protein: 16, serat: 7, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Pare', 'pare', '1 buah kecil', 2500, 'sayur'), b('Ikan teri', 'teri', '1 genggam', 3000, 'protein'), b('Bawang merah', 'bawang', '2 siung', 500, 'bumbu'), b('Cabai rawit', 'cabai', '3 buah', 700, 'bumbu')],
    langkah: ['Iris tipis pare, remas dengan sedikit garam lalu bilas.', 'Goreng teri sebentar, tumis bawang dan cabai.', 'Masukkan pare, masak sebentar hingga layu, sajikan dengan nasi.'],
  },
  {
    id: 'sup-enoki-tahu-telur', nama: 'Sup Jamur Enoki Tahu & Telur', slot: 'malam', emoji: '🍲', waktu: 12,
    alat: ['Rice Cooker', ...masak], tags: ['telur', 'kacang'], kalori: 360, protein: 18, serat: 5, karbo: 42,
    bahan: [b('Nasi putih', 'nasi', '1 mangkuk', 1500, 'karbo'), b('Jamur enoki', 'jamur enoki', '1 bungkus', 4000, 'sayur'), b('Tahu putih', 'tahu', '2 potong', 1500, 'protein'), b('Telur ayam', 'telur', '1 butir', 1800, 'protein'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Didihkan air dengan bawang putih dan garam.', 'Masukkan tahu dadu dan jamur enoki.', 'Tuang telur kocok sambil diaduk perlahan, sajikan hangat.'],
  },
  {
    id: 'tahu-jamur-saus-tiram', nama: 'Tumis Tahu Jamur Saus Tiram', slot: 'malam', emoji: '🍄', waktu: 12,
    alat: masak, tags: ['kacang'], kalori: 380, protein: 16, serat: 6, karbo: 50,
    bahan: [b('Nasi putih', 'nasi', '1 piring', 1500, 'karbo'), b('Tahu putih', 'tahu', '3 potong', 2000, 'protein'), b('Jamur tiram', 'jamur tiram', '100 g', 3000, 'sayur'), b('Saus tiram', 'saus tiram', '1 sdm', 1000, 'bumbu'), b('Bawang putih', 'bawang', '2 siung', 500, 'bumbu')],
    langkah: ['Goreng tahu setengah matang.', 'Tumis bawang putih, masukkan jamur tiram suwir dan tahu.', 'Tambahkan saus tiram dan sedikit air, masak sebentar.'],
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
  nama: 'Pengguna NutriKos',
  email: '',
  kampus: '',
  prodi: '',
  semester: '1',
  avatar: '👩‍🎓',
  jenisKelamin: 'Perempuan',
  budget: 30000,
  alat: [],
  pantangan: [],
  lokasi: '',
  stok: [],
};

export const AVATARS = ['👩‍🎓', '🧑‍🎓', '👨‍🎓', '🧕', '😊', '🧑‍🍳'];

/**
 * Memeriksa kelengkapan data diri dan profil kos pengguna.
 * Mengembalikan daftar field yang masih kosong beserta ringkasan progresnya.
 */
export function cekKelengkapanProfil(profile) {
  const p = profile || {};
  const daftar = [
    {
      kunci: 'nama',
      label: 'Nama Lengkap',
      terisi: Boolean(p.nama?.trim() && p.nama.trim() !== 'Pengguna NutriKos'),
      href: '/profil#nama',
      kelompok: 'diri',
    },
    {
      kunci: 'kampus',
      label: 'Asal Kampus',
      terisi: Boolean(p.kampus?.trim()),
      href: '/profil#kampus',
      kelompok: 'diri',
    },
    {
      kunci: 'prodi',
      label: 'Program Studi',
      terisi: Boolean(p.prodi?.trim()),
      href: '/profil#prodi',
      kelompok: 'diri',
    },
    {
      kunci: 'lokasi',
      label: 'Lokasi Kos',
      terisi: Boolean(p.lokasi?.trim()),
      href: '/profil-kos#lokasi',
      kelompok: 'kos',
    },
    {
      kunci: 'alat',
      label: 'Alat Masak Kos',
      terisi: Array.isArray(p.alat) && p.alat.length > 0,
      href: '/profil-kos',
      kelompok: 'kos',
      opsionalJikaKosLengkap: true,
    },
  ];

  const kosong = daftar.filter((d) => !d.terisi);
  const kosongDataDiri = kosong.filter((d) => d.kelompok === 'diri');
  const kosongKos = kosong.filter((d) => d.kelompok === 'kos');
  const wajibKosong = kosong.filter((d) => !d.opsionalJikaKosLengkap);
  const jumlahTerisi = daftar.filter((d) => d.terisi).length;

  return {
    daftar,
    kosong,
    kosongDataDiri,
    kosongKos,
    wajibKosong,
    // Dianggap perlu pemberitahuan jika data inti (nama/kampus/prodi/lokasi) ada yang masih kosong
    perluDilengkapi: wajibKosong.length > 0,
    jumlahTerisi,
    total: daftar.length,
    persen: Math.round((jumlahTerisi / daftar.length) * 100),
  };
}
