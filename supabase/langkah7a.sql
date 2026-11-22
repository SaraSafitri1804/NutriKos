-- NutriKos - langkah 7a: bahan di kos + nilai bawaan profil kos.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- (Peringatan "drop" muncul karena ada perintah drop policy if exists; aman.)

-- 1) Nilai bawaan profil kos disamakan dengan aplikasi (akun baru langsung punya alat dan pantangan umum).
alter table public.profil_kos alter column alat_masak       set default array['Rice Cooker', 'Kompor'];
alter table public.profil_kos alter column alergi_pantangan set default array['100% Halal'];
alter table public.profil_kos alter column lokasi           set default 'Dekat UNUSIA, Kab. Bogor';

-- Akun yang sudah dibuat sebelumnya dan belum pernah mengubah apa pun ikut diberi nilai bawaan.
update public.profil_kos
   set alat_masak = array['Rice Cooker', 'Kompor'],
       alergi_pantangan = array['100% Halal']
 where alat_masak = '{}' and alergi_pantangan = '{}';

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
