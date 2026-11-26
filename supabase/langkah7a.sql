-- NutriKos - langkah 7a: bahan di kos + nilai bawaan profil kos.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- (Peringatan "drop" muncul karena ada perintah drop policy if exists; aman.)

-- 1) Nilai bawaan profil kos dimulai kosong agar pengguna mengisi sendiri sesuai kondisi kosnya.
alter table public.profil_kos alter column alat_masak       set default '{}';
alter table public.profil_kos alter column alergi_pantangan set default '{}';
alter table public.profil_kos alter column lokasi           set default '';

-- 2) Bahan di kos (bahan sisa) milik tiap pengguna.
create table if not exists public.bahan_sisa (
  id          uuid primary key default gen_random_uuid(),
  pengguna_id uuid not null references public.pengguna (id) on delete cascade,
  nama        text not null,
  dibuat_pada timestamptz not null default now(),
  unique (pengguna_id, nama)
);

alter table public.bahan_sisa enable row level security;
drop policy if exists "bahan_sisa_milik_sendiri" on public.bahan_sisa;
create policy "bahan_sisa_milik_sendiri" on public.bahan_sisa
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);

grant select, insert, update, delete on public.bahan_sisa to authenticated;
