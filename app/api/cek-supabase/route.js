// Rute sementara untuk memastikan koneksi Supabase benar. Hapus setelah langkah 6b berjalan.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, masalah: 'Variabel NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local (restart npm run dev setelah mengisi).' }, { status: 500 });
  }
  try {
    const auth = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
    const tabel = await fetch(`${url}/rest/v1/pengguna?select=id&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    return Response.json({
      ok: auth.ok,
      auth: auth.ok ? 'terhubung' : `gagal (${auth.status}) - cek URL dan anon key`,
      // 200 = ada; 401/403 = ada tetapi dilindungi RLS (benar, anon tidak boleh membaca); 404 = belum dibuat
      tabel_pengguna: tabel.status === 404 ? 'belum ada - jalankan supabase/schema.sql di SQL Editor' : (tabel.status === 401 || tabel.status === 403 || tabel.ok) ? 'ada (dilindungi RLS)' : `status tidak dikenal (${tabel.status})`,
    });
  } catch (e) {
    return Response.json({ ok: false, masalah: 'Tidak bisa menghubungi Supabase. Cek NEXT_PUBLIC_SUPABASE_URL.' }, { status: 500 });
  }
}
