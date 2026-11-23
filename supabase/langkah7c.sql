-- NutriKos - langkah 7c: daftar belanja.
-- Isi daftar belanja diturunkan dari menu terpilih dikurangi bahan di kos (dihitung aplikasi).
-- Tabel ini menyimpan kondisi buatan pengguna: bahan yang sudah dibeli (dicentang),
-- resep tambahan, item belanja manual, perubahan item, dan item yang dihapus.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.

create table if not exists public.daftar_belanja (
  pengguna_id    uuid primary key references public.pengguna (id) on delete cascade,
  kondisi        jsonb not null default '{}'::jsonb,
  diperbarui_pada timestamptz not null default now()
);

alter table public.daftar_belanja enable row level security;
drop policy if exists "daftar_belanja_milik_sendiri" on public.daftar_belanja;
create policy "daftar_belanja_milik_sendiri" on public.daftar_belanja
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);

grant select, insert, update, delete on public.daftar_belanja to authenticated;
