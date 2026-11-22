// Lingkaran persentase. Hijau bila >= 80%, kuning 50-79%, biru bila < 50% tidak dipakai (lihat tone di halaman).
export default function Ring({ persen, label, detail, size = 'h-20 w-20', horizontal = false }) {
  const p = Math.max(0, Math.min(100, persen));
  const warna = persen >= 80 ? '#16A34A' : persen >= 50 ? '#3B54B8' : '#F59E0B';
  const r = 36;
  const c = 2 * Math.PI * r;
  const lingkaran = (
    <div className={`relative shrink-0 ${size}`}>
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={warna} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">{persen}%</div>
    </div>
  );
  if (horizontal) {
    return (
      <div className="flex items-center gap-3">
        {lingkaran}
        <div className="min-w-0"><div className="text-sm font-bold">{label}</div><div className="text-xs text-slate-500">{detail}</div></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center text-center">
      {lingkaran}
      <div className="mt-1 text-sm font-bold">{label}</div>
      <div className="text-xs text-slate-500">{detail}</div>
    </div>
  );
}
