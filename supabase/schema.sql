-- NutriKos - skema database langkah 6a (akun pengguna dan profil kos).
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.
-- Kata sandi TIDAK disimpan di tabel ini: Supabase Auth menyimpannya di auth.users
-- dalam bentuk hash bcrypt, dan sesi login memakai token JWT.

create table if not exists public.pengguna (
  id            uuid primary key references auth.users (id) on delete cascade,
  nama          text not null default '',
  email         text unique,
  kampus        text,
  program_studi text,
  semester      int,
  avatar        text,
  dibuat_pada   timestamptz not null default now()
);

create table if not exists public.profil_kos (
  id               uuid primary key default gen_random_uuid(),
  pengguna_id      uuid not null unique references public.pengguna (id) on delete cascade,
  budget_harian    int  not null default 30000,
  alat_masak       text[] not null default '{}',
  alergi_pantangan text[] not null default '{}',
  jenis_kelamin    text not null default 'Perempuan',
  lokasi           text
);

-- Row Level Security: setiap pengguna hanya bisa membaca dan mengubah datanya sendiri.
alter table public.pengguna   enable row level security;
alter table public.profil_kos enable row level security;

drop policy if exists "pengguna_baca_sendiri"  on public.pengguna;
drop policy if exists "pengguna_ubah_sendiri"  on public.pengguna;
drop policy if exists "profil_kos_milik_sendiri" on public.profil_kos;

create policy "pengguna_baca_sendiri" on public.pengguna
  for select using (auth.uid() = id);
create policy "pengguna_ubah_sendiri" on public.pengguna
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profil_kos_milik_sendiri" on public.profil_kos
  for all using (auth.uid() = pengguna_id) with check (auth.uid() = pengguna_id);

-- Izin akses lewat Data API: hanya pengguna yang sudah login (peran authenticated).
-- RLS di atas tetap membatasi setiap pengguna ke barisnya sendiri.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.pengguna   to authenticated;
grant select, insert, update, delete on public.profil_kos to authenticated;

-- Saat akun baru dibuat, otomatis isi tabel pengguna dan profil_kos.
create or replace function public.buat_pengguna_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pengguna (id, nama, email, kampus, program_studi, semester)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    new.email,
    new.raw_user_meta_data ->> 'kampus',
    new.raw_user_meta_data ->> 'program_studi',
    nullif(new.raw_user_meta_data ->> 'semester', '')::int
  );
  insert into public.profil_kos (pengguna_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists saat_akun_dibuat on auth.users;
create trigger saat_akun_dibuat
  after insert on auth.users
  for each row execute function public.buat_pengguna_baru();
