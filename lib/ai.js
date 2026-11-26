// Memanggil /api/rekomendasi. Mengembalikan null bila gagal (pemanggil memakai cadangan lokal).
export async function mintaAI(mode, profile) {
  try {
    const { budget, alat, pantangan, stok } = profile || {};
    const res = await fetch('/api/rekomendasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, profile: { budget, alat, pantangan, stok } }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Fitur Chat Interaktif dengan Asisten AI NutriKos
export async function chatAI(pesan, profile, riwayat = []) {
  try {
    const { nama, budget, alat, pantangan, stok } = profile || {};
    const res = await fetch('/api/rekomendasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'chat',
        pesan,
        riwayat,
        profile: { nama, budget, alat, pantangan, stok },
      }),
    });
    if (!res.ok) return { balasan: 'Lagi ada gangguan nih, coba tanya lagi bentar ya!' };
    return await res.json();
  } catch (e) {
    return { balasan: 'Koneksi putus nih. Cek internet dulu ya, terus tanya lagi!' };
  }
}
