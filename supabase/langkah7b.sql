-- NutriKos - langkah 7b: menu terjadwal, favorit, dan riwayat menu.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- resep_id berisi id resep (teks) dari berkas data aplikasi, karena data resep
-- belum disimpan di database (lihat revisi proposal pada langkah 7c).

create table if not exists public.jadwal_makan (
  id          uuid primary key default gen_random_uuid(),
  pengguna_id uuid not null references public.pengguna (id) on delete cascade,
  resep_id    text not null,
  tanggal     date not null,
  waktu_makan text not null,                       -- pagi | siang | malam
  rincian     jsonb not null default '{}'::jsonb,  -- porsi khusus, dsb.
  unique (pengguna_id, tanggal, resep_id)
);
create index if not exists jadwal_makan_pengguna_tanggal on public.jadwal_makan (pengguna_id, tanggal);

create table if not exists public.favorit (
  pengguna_id uuid not null references public.pengguna (id) on delete cascade,
  resep_id    text not null,
  tanggal     date not null default current_date,
  primary key (pengguna_id, resep_id)
);

create table if not exists public.riwayat_menu (
  pengguna_id uuid not null references public.pengguna (id) on delete cascade,
  resep_id    text not null,
  tanggal     date not null,
  primary key (pengguna_id, tanggal, resep_id)
);

alter table public.jadwal_makan enable row level security;
alter table public.favorit      enable row level security;
alter table public.riwayat_menu enable row level security;

drop policy if exists "jadwal_makan_milik_sendiri" on public.jadwal_makan;
drop policy if exists "favorit_milik_sendiri"      on public.favorit;
drop policy if exists "riwayat_menu_milik_sendiri" on public.riwayat_menu;

create policy "jadwal_makan_milik_sendiri" on public.jadwal_makan
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);
create policy "favorit_milik_sendiri" on public.favorit
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);
create policy "riwayat_menu_milik_sendiri" on public.riwayat_menu
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);

grant select, insert, update, delete on public.jadwal_makan to authenticated;
grant select, insert, update, delete on public.favorit      to authenticated;
grant select, insert, update, delete on public.riwayat_menu to authenticated;
