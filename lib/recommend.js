import { RECIPES, SLOTS, PANTANGAN_TAG, getRecipe } from './data';

export function allowedRecipes(profile) {
  const avoid = (profile?.pantangan || []).map((p) => PANTANGAN_TAG[p]).filter(Boolean);
  const alat = profile?.alat || [];
  return RECIPES.filter((r) => {
    if (r.tags.some((t) => avoid.includes(t))) return false;
    if (alat.length === 0) return true; // jika belum memilih alat, tampilkan semua 50 resep
    if (r.alat.length === 0) return true;
    return r.alat.some((a) => alat.includes(a));
  });
}

// Rekomendasi menu harian: 1 menu per waktu makan, total <= budget, protein & serat setinggi mungkin.
export function recommendDaily(profile) {
  const ok = allowedRecipes(profile);
  const bySlot = SLOTS.map((s) => ok.filter((r) => r.slot === s));
  if (bySlot.some((l) => l.length === 0)) {
    // fallback: ambil apa saja yang tersedia
    return bySlot.map((l) => l[0]).filter(Boolean).map((r) => r.id);
  }
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < 80; i++) {
    const combo = bySlot.map((l) => l[Math.floor(Math.random() * l.length)]);
    const cost = combo.reduce((s, r) => s + r.harga, 0);
    const nutri = combo.reduce((s, r) => s + r.protein + r.serat * 2, 0);
    const score = cost <= profile.budget ? nutri + Math.random() : -cost;
    if (score > bestScore) { bestScore = score; best = combo; }
  }
  return best.map((r) => r.id);
}

export function recommendWeekly(profile) {
  return Array.from({ length: 7 }, () => recommendDaily(profile));
}

export const cocok = (stokItem, kunci) => stokItem.toLowerCase().includes(kunci) || kunci.includes(stokItem.toLowerCase());
export const adaDiStok = (profile, kunci) => (profile.stok || []).some((s) => cocok(s, kunci));

// Ide masakan dari bahan yang dimiliki.
export function ideasFromStock(profile) {
  return allowedRecipes(profile)
    .map((r) => {
      const punya = r.bahan.filter((x) => adaDiStok(profile, x.kunci));
      const kurang = r.bahan.filter((x) => !adaDiStok(profile, x.kunci));
      return { recipe: r, persen: Math.round((punya.length / r.bahan.length) * 100), kurang, biaya: kurang.reduce((s, x) => s + x.harga, 0) };
    })
    .filter((x) => x.persen > 0)
    .sort((a, b) => b.persen - a.persen || a.biaya - b.biaya)
    .slice(0, 6);
}

// Daftar belanja dari menu terpilih.
export function buildShopping(profile, ids, planDetails = {}) {
  const map = new Map();
  ids.forEach((id) => {
    const r = getRecipe(id);
    if (!r) return;
    const porsi = planDetails[id]?.porsi || 1;
    r.bahan.forEach((x) => {
      const cur = map.get(x.nama);
      const scaledHarga = Math.round(x.harga * porsi);
      const qtyText = porsi > 1 ? `${x.qty} (x${porsi} porsi)` : x.qty;
      if (cur) {
        cur.harga += scaledHarga;
        cur.untuk.add(r.nama);
      } else {
        map.set(x.nama, {
          ...x,
          qty: qtyText,
          harga: scaledHarga,
          untuk: new Set([r.nama]),
          sudahAda: adaDiStok(profile, x.kunci)
        });
      }
    });
  });
  return [...map.values()].map((x) => ({ ...x, untuk: [...x.untuk].join(', ') }));
}

export function nutrisiDari(ids, planDetails = {}) {
  return ids.reduce(
    (t, id) => {
      const r = getRecipe(id);
      if (!r) return t;
      const porsi = planDetails[id]?.porsi || 1;
      return {
        protein: Math.round(t.protein + r.protein * porsi),
        serat: Math.round(t.serat + r.serat * porsi),
        karbo: Math.round(t.karbo + r.karbo * porsi),
        kalori: Math.round(t.kalori + r.kalori * porsi),
        biaya: Math.round(t.biaya + r.harga * porsi)
      };
    },
    { protein: 0, serat: 0, karbo: 0, kalori: 0, biaya: 0 }
  );
}
