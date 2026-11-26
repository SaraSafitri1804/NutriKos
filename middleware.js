import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Halaman publik yang boleh dibuka tanpa login (termasuk landing page '/').
const RUTE_AKUN = ['/', '/mulai', '/login', '/register', '/lupa-sandi', '/reset-sandi'];

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
    response.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value, c);
    });
    return res;
  };

  if (path.startsWith('/api/')) {
    if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    return response;
  }

  // Jika pengunjung belum login mencoba membuka halaman aplikasi, arahkan ke login
  if (!user && !RUTE_AKUN.includes(path)) {
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = '/login';
    tujuan.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return alihkan(tujuan);
  }

  // Jika pengguna SUDAH login membuka landing page ('/' atau '/mulai'), langsung bawa ke /beranda
  if (user && (path === '/' || path === '/mulai')) {
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = '/beranda';
    tujuan.search = '';
    return alihkan(tujuan);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)'],
};
