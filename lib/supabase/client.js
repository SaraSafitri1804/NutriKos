import { createBrowserClient } from '@supabase/ssr';

// Dipakai di komponen 'use client'. Hanya memakai URL dan anon key (aman tampil di peramban).
// Keamanan data dijaga oleh Row Level Security di database, bukan oleh kerahasiaan kunci ini.
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local');
  return createBrowserClient(url, key);
}
