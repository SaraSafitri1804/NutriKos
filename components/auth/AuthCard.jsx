'use client';
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AuthCard({ badge, judul, deskripsi, children, lebar = 'max-w-md' }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-surface px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo NutriKos" className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm" />
          <span className="text-2xl font-extrabold">NutriKos</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Nutrisi Cerdas &amp; Anggaran Sehat Mahasiswa Kos</p>
      </div>
      <div className={`w-full ${lebar} rounded-3xl bg-white p-6 shadow-lg sm:p-8`}>
        {badge && <div className="mb-3 text-center"><span className="inline-block rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark">{badge}</span></div>}
        <h1 className="text-center text-2xl font-extrabold">{judul}</h1>
        {deskripsi && <p className="mt-2 text-center text-sm text-slate-500">{deskripsi}</p>}
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-8 text-xs text-slate-400">© 2026 NutriKos · Tim CODIVA, UNUSIA</p>
    </div>
  );
}

export function Pesan({ jenis = 'error', children }) {
  if (!children) return null;
  const ok = jenis === 'ok';
  const Ikon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div role={ok ? 'status' : 'alert'} className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${ok ? 'bg-success-light text-success-dark' : 'bg-red-50 text-red-700'}`}>
      <Ikon size={17} className="mt-0.5 shrink-0" /> <span>{children}</span>
    </div>
  );
}

export function Field({ id, label, Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-slate-800">{label}</label>
      <div className="relative">
        {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        {children}
      </div>
    </div>
  );
}

export function InputSandi({ id, value, onChange, placeholder, autoComplete, Icon, ...rest }) {
  const [lihat, setLihat] = useState(false);
  return (
    <>
      {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input id={id} type={lihat ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="input !rounded-xl !border-transparent !bg-slate-50 !py-3 !pl-10 !pr-11" {...rest} />
      <button type="button" onClick={() => setLihat(!lihat)} aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {lihat ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  );
}

export const kelasInput = 'input !rounded-xl !border-transparent !bg-slate-50 !py-3 !pl-10';
