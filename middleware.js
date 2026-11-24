import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Halaman akun yang boleh dibuka tanpa login.
const RUTE_AKUN = ['/mulai', '/login', '/register', '/lupa-sandi', '/reset-sandi'];
// Halaman yang hanya untuk tamu: pengguna yang sudah login dialihkan ke Beranda.
const HANYA_TAMU = ['/mulai', '/login', '/register'];

export async function middleware(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next(); // Supabase belum dikonfigurasi (mode pengembangan awal)

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() memverifikasi token ke server Supabase (lebih aman daripada hanya membaca cookie).
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Bawa cookie sesi yang diperbarui ke respons pengalihan.
  const alihkan = (tujuan) => {
    const res = NextResponse.redirect(tujuan);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (path.startsWith('/api/')) {
    if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    return response;
  }
  if (!user && !RUTE_AKUN.includes(path)) {
    const tujuan = request.nextUrl.clone();
    // Pengunjung baru di halaman utama melihat halaman perkenalan; halaman lain meminta login.
    tujuan.pathname = path === '/' ? '/mulai' : '/login';
    tujuan.search = path === '/' ? '' : `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return alihkan(tujuan);
  }
  if (user && HANYA_TAMU.includes(path)) {
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = '/';
    tujuan.search = '';
    return alihkan(tujuan);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)'],
};
