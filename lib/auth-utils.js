// Menerjemahkan pesan error Supabase Auth ke bahasa Indonesia yang ramah.
export function terjemahError(pesan = '') {
  const m = String(pesan);
  if (/invalid login credentials/i.test(m)) return 'Email atau kata sandi salah.';
  if (/already registered|already been registered/i.test(m)) return 'Email ini sudah terdaftar. Silakan masuk.';
  if (/password should be at least/i.test(m)) return 'Kata sandi terlalu pendek.';
  if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi. Cek kotak masuk emailmu.';
  if (/same password|different from the old/i.test(m)) return 'Kata sandi baru harus berbeda dari yang lama.';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (/valid email|invalid email/i.test(m)) return 'Format email tidak valid.';
  if (/fetch|network|failed to/i.test(m)) return 'Tidak bisa terhubung ke server. Cek koneksi internetmu.';
  if (/belum diisi di \.env/i.test(m)) return 'Konfigurasi Supabase belum diisi di .env.local.';
  return 'Terjadi kesalahan. Coba lagi.';
}

// Kekuatan kata sandi sederhana: 0 (kosong) sampai 3 (kuat).
export function kekuatanSandi(pw = '') {
  if (!pw) return { skor: 0, label: 'Belum terisi' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  else if (/\d/.test(pw) && pw.length >= 10) s++;
  s = Math.max(1, s);
  return { skor: s, label: ['', 'Lemah', 'Cukup', 'Kuat'][s] };
}

export const SANDI_MIN = 8;
