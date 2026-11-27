import { RECIPES, SLOTS, SLOT_LABEL, getRecipe, targetGizi } from '@/lib/data';
import { allowedRecipes, recommendDaily, ideasFromStock, nutrisiDari } from '@/lib/recommend';

export const runtime = 'nodejs';

// ---- pembatas sederhana (per IP, 20 permintaan / menit) ----
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

const bersih = (s, n = 50) => String(s).replace(/[^\p{L}\p{N}\s&/().,-]/gu, '').slice(0, n).trim();

function bacaProfil(p = {}) {
  return {
    nama: p.nama ? bersih(p.nama, 50) : '',
    budget: Math.min(100000, Math.max(10000, Number(p.budget) || 30000)),
    alat: (Array.isArray(p.alat) ? p.alat : []).slice(0, 8).map((x) => bersih(x)),
    pantangan: (Array.isArray(p.pantangan) ? p.pantangan : []).slice(0, 8).map((x) => bersih(x)),
    stok: (Array.isArray(p.stok) ? p.stok : []).slice(0, 20).map((x) => bersih(x)).filter(Boolean),
  };
}

function bangunPrompt(mode, profil, kandidat) {
  const daftar = kandidat
    .map(
      (r) =>
        `${r.id} | ${r.slot} | ${r.nama} | Rp${r.harga} | protein ${r.protein}g | serat ${r.serat}g | bahan: ${r.bahan.map((b) => b.nama).join(', ')}`
    )
    .join('\n');

  const tugas =
    mode === 'bahan'
      ? 'Pilih 3 resep yang paling bisa dimasak dari bahan stok pengguna dengan tambahan belanja paling sedikit.'
      : 'Pilih TEPAT 3 resep: satu untuk slot pagi, satu untuk siang, satu untuk malam. Total harga harus <= budget harian. Utamakan protein dan serat tinggi serta pemakaian bahan stok agar belanja minimal.';

  return `Kamu adalah asisten gizi cerdas untuk mahasiswa anak kos di Indonesia bernama NutriKos AI. ${tugas}
Data pengguna:
Bujet harian: Rp${profil.budget}
Bahan stok kos: ${profil.stok.join(', ') || '(kosong)'}
Daftar resep yang boleh dipilih (id | slot | nama | harga | gizi | bahan):
${daftar}

Jawab HANYA JSON valid tanpa format markdown atau teks lain, contoh format persis:
{"ids":["id1","id2","id3"],"alasan":"2-3 kalimat penjelasan ramah dan solutif mengapa menu ini cocok untuk bujet dan kesehatan mahasiswa kos."}
Gunakan HANYA ID dari daftar resep di atas.`;
}

function bangunPromptChat(pesan, profil, riwayat = []) {
  const riwayatTeks = riwayat.length
    ? riwayat
        .map((m) => `${m.dari === 'user' ? 'Mahasiswa' : 'NutriKos AI'}: ${m.teks}`)
        .join('\n')
    : '';

  return `Kamu adalah NutriKos AI — teman ngobrol sekaligus konsultan gizi buat anak kos di Indonesia. Kamu bukan chatbot formal, kamu teman yang asyik, ngerti banget kondisi kantong tipis akhir bulan, dan selalu punya solusi kreatif.

Kepribadianmu:
- Ngobrol natural, santai, kayak temen kuliah — pakai "kamu", bisa sesekali pakai kata gaul/Gen Z yang wajar (nggak lebay)
- Langsung to the point, nggak pakai basa-basi panjang di awal (jangan mulai dengan "Halo!" terus panjang lebar)
- Kalau ditanya resep, langsung kasih resep + estimasi harganya
- Kalau bisa dihemat, kasih trik konkret (pasar subuh, beli satuan, rice cooker hack, warung gang, dll)
- Responsmu variatif — jangan selalu 3-4 paragraf, sesuaikan panjang jawaban dengan pertanyaannya. Kalau pertanyaan simpel, jawab singkat. Kalau kompleks, boleh panjangan dikit
- Jangan pakai format bullet yang terlalu kaku kalau nggak perlu; kadang jawab mengalir aja lebih enak

Profil mahasiswa ini:
${profil?.nama ? `- Nama: ${profil.nama}\n` : ''}- Bujet: Rp${(profil?.budget || 30000).toLocaleString('id-ID')}/hari
- Alat masak: ${(profil?.alat?.length ? profil.alat : ['Rice Cooker', 'Kompor']).join(', ')}
- Pantangan: ${(profil?.pantangan?.length ? profil.pantangan : ['Halal']).join(', ')}
- Stok bahan di kos: ${(profil?.stok?.length ? profil.stok : ['—']).join(', ')}

${riwayatTeks ? `Riwayat obrolan sebelumnya:\n${riwayatTeks}\n` : ''}
Pesan terbaru mahasiswa: "${pesan}"

Balas sebagai NutriKos AI. Langsung jawab tanpa nulis "NutriKos AI:" di depannya.`;
}

async function panggilAI(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (key) {
    // Model resmi yang aktif dan terverifikasi untuk API key Gemini baru (prefix AQ. / AIza)
    const models = [...new Set([
      process.env.GEMINI_MODEL?.trim(),
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ].filter(Boolean))];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
            },
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (r.ok) {
          const j = await r.json();
          const text = j.candidates?.[0]?.content?.parts
            ?.filter((p) => !p.thought)
            .map((p) => p.text || '')
            .join('') || '';
          if (text) {
            console.log(`[NutriKos AI] Sukses memanggil model: ${model}`);
            return text;
          }
        } else {
          const errBody = await r.text().catch(() => '');
          console.warn(`[NutriKos AI] ${model} status ${r.status}:`, errBody.slice(0, 150));
        }
      } catch (err) {
        console.warn(`[NutriKos AI] Error fetch ${model}:`, err.message);
      }
    }
  }

  // Coba Anthropic jika ada
  if (process.env.ANTHROPIC_API_KEY) {
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (r.ok) {
        const j = await r.json();
        return j.content?.map((c) => c.text || '').join('') || '';
      }
    } catch (err) {
      console.warn('[NutriKos AI] Gagal Anthropic:', err.message);
    }
  }

  throw new Error('API key belum valid atau tidak dapat terhubung');
}

function parseJson(teks) {
  const potong = teks.replace(/```json|```/g, '').trim();
  const mulai = potong.indexOf('{');
  const akhir = potong.lastIndexOf('}');
  if (mulai === -1 || akhir === -1) throw new Error('Format JSON tidak ditemukan');
  return JSON.parse(potong.slice(mulai, akhir + 1));
}

function hasilAturan(mode, profil) {
  if (mode === 'bahan') {
    const ide = ideasFromStock(profil).slice(0, 3);
    return {
      ids: ide.map((x) => x.recipe.id),
      alasan: `Dipilih berdasarkan ${profil.stok.length} bahan stok yang kamu punya di kos agar menghemat belanja dan tidak mubazir.`,
      sumber: 'aturan',
    };
  }
  const plan = recommendDaily(profil);
  const n = nutrisiDari(plan);
  return {
    ids: plan,
    alasan: `Paket menu seimbang ini disusun pas dengan target bujetmu (${profil.budget ? 'Rp' + profil.budget.toLocaleString('id-ID') : 'Rp30.000'}/hari) serta memaksimalkan asupan protein (${n.protein}g) dan serat (${n.serat}g) untuk stamina kuliah harianmu.`,
    sumber: 'aturan',
  };
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'lokal';
  if (limited(ip)) {
    return Response.json(
      { error: 'Terlalu banyak permintaan, coba lagi sebentar.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Format JSON salah' }, { status: 400 });
  }

  const mode = body.mode || 'menu';
  const profil = bacaProfil(body.profile);

  // 1. Mode Chat Interaktif dengan AI
  if (mode === 'chat') {
    const pesan = String(body.pesan || '').trim();
    const riwayat = Array.isArray(body.riwayat) ? body.riwayat.slice(-10) : [];
    if (!pesan) return Response.json({ balasan: 'Hei, mau tanya apa nih? Soal menu, bujet, atau resep?' });

    try {
      const prompt = bangunPromptChat(pesan, profil, riwayat);
      const jawaban = await panggilAI(prompt);
      return Response.json({ balasan: jawaban, sumber: 'ai' });
    } catch (e) {
      // Fallback cerdas berbasis 50 resep & profil pengguna jika API AI tidak tersedia
      const q = pesan.toLowerCase();
      const stopwords = new Set(['yang', 'dan', 'untuk', 'buat', 'mau', 'apa', 'ada', 'bisa', 'atau', 'dengan', 'pakai', 'cari', 'menu', 'makan', 'resep', 'masak', 'masakan', 'enak', 'enaknya', 'dong', 'nih', 'sih', 'kak', 'min', 'hari', 'ini', 'kira', 'kalau', 'kalo', 'cuma', 'punya', 'paling', 'kamar', 'kos', 'kosan', 'gimana', 'cara', 'bikin', 'tapi', 'aku', 'saya', 'gue', 'tidak', 'nggak', 'gak', 'bukan', 'tanpa', 'sama', 'apain', 'diapain', 'jadi', 'aja', 'saja', 'masih', 'lagi', 'yah', 'deh']);
      const sinonim = { cabe: 'cabai', telor: 'telur', mie: 'mi', kubis: 'kol', kobis: 'kol', sayur: 'sayur' };

      // Deteksi bahan yang tidak dimiliki / ingin dihindari ("ga punya udang", "tanpa telur", "gak ada ayam")
      const hindari = [];
      const polaHindari = /\b(?:ga|gak|nggak|tidak|tak|tanpa|bukan|gapunya)\s+(?:punya\s+|ada\s+|pakai\s+)?([a-z]+)/g;
      for (const m of q.matchAll(polaHindari)) {
        const w = sinonim[m[1]] || m[1];
        if (w && w.length >= 3 && !stopwords.has(w)) hindari.push(w);
      }
      const setHindari = new Set(hindari);

      const kata = q
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .map((w) => sinonim[w] || w)
        .filter((w) => w.length >= 3 && !stopwords.has(w) && !setHindari.has(w));
      const kandidatChat = allowedRecipes(profil);
      const sumberDasar = kandidatChat.length ? kandidatChat : RECIPES;
      const sumberResep = setHindari.size
        ? sumberDasar.filter((r) => {
            const teks = `${r.nama} ${r.bahan.map((b) => `${b.nama} ${b.kunci}`).join(' ')}`.toLowerCase();
            return ![...setHindari].some((h) => teks.includes(h));
          })
        : sumberDasar;

      // Jika user hanya bilang "ga punya X" tanpa kata kunci lain, ambil topik bahan/menu dari pesan user sebelumnya
      const kataKonteks = kata.length === 0 && riwayat.length
        ? riwayat
            .filter((m) => m.dari === 'user')
            .slice(-2)
            .map((m) => m.teks || '')
            .join(' ')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 3 && !stopwords.has(w) && !setHindari.has(w))
        : [];
      const kataCari = kata.length ? kata : kataKonteks;

      const cariCocok = () =>
        sumberResep
          .map((r) => {
            let skor = 0;
            const nama = r.nama.toLowerCase();
            const bahan = r.bahan.map((b) => `${b.nama} ${b.kunci}`.toLowerCase()).join(' ');
            const alat = r.alat.map((a) => a.toLowerCase()).join(' ');
            const slot = (SLOT_LABEL[r.slot] || r.slot).toLowerCase();
            for (const k of kataCari) {
              if (nama.includes(k)) skor += 3;
              if (bahan.includes(k)) skor += 2;
              if (alat.includes(k) || slot.includes(k)) skor += 2;
            }
            if (q.includes('protein') && r.protein >= 18) skor += 2;
            if ((q.includes('hemat') || q.includes('murah') || q.includes('bujet')) && r.harga <= 10000) skor += 2;
            if (q.includes('cepat') && r.waktu <= 10) skor += 2;
            if (q.includes('sarapan') || q.includes('pagi')) { if (r.slot === 'pagi') skor += 2; }
            if (q.includes('siang')) { if (r.slot === 'siang') skor += 2; }
            if (q.includes('malam')) { if (r.slot === 'malam') skor += 2; }
            if (q.includes('rice cooker') && r.alat.includes('Rice Cooker')) skor += 3;
            return { r, skor };
          })
          .filter((x) => x.skor > 0)
          .sort((a, b) => b.skor - a.skor || a.r.harga - b.r.harga)
          .slice(0, 3)
          .map((x) => x.r);

      let fallbackText;
      const pilihNomor = q.match(/(?:\bno\.?\s*|\bnomor\s*|\bke[-\s]*|\bpilih\s*|\byang\s*|\byg\s*)?([1-9])\b/) && /\b(?:no|nomor|pilih|mau|yg|yang|ke)\b|^\s*[1-9]\s*$/.test(q);
      if (pilihNomor) {
        const angka = Number(q.match(/([1-9])/)?.[1]);
        const aiTerakhir = [...riwayat].reverse().find((m) => m.dari === 'ai')?.teks || '';
        const cocokBaris = [...aiTerakhir.matchAll(/^\s*([1-9])\.\s+([^\n]+)/gm)].find((m) => Number(m[1]) === angka);
        const judulDipilih = cocokBaris?.[2]?.split(/\s*[—(]/)[0]?.trim().toLowerCase();
        const resepDipilih = judulDipilih ? RECIPES.find((r) => r.nama.toLowerCase() === judulDipilih || r.nama.toLowerCase().includes(judulDipilih)) : null;
        if (resepDipilih) {
          fallbackText = `Oke, ini resep ${resepDipilih.nama} (~Rp${resepDipilih.harga.toLocaleString('id-ID')}, ${resepDipilih.waktu} menit):\nBahan: ${resepDipilih.bahan.map((b) => `${b.nama} (${b.qty})`).join(', ')}\nLangkah:\n${resepDipilih.langkah.map((l, i) => `${i + 1}. ${l}`).join('\n')}`;
        }
      }

      if (fallbackText) {
        // sudah terisi dari pilihan nomor
      } else if (/\b(makasih|terima\s*kasih|thanks|thank\s*you|thx|tq)\b/.test(q)) {
        const sapa = profil.nama ? profil.nama.split(' ')[0] : 'Sobat';
        fallbackText = `Sama-sama, ${sapa}! Kalau butuh ide masak, resep, atau tips hemat lagi, tinggal chat aja ya 😊`;
      } else if (/^\s*(ok|oke|okey|okay|sip|siap|mantap|bagus|baik|iya|ya|noted)\b/.test(q) && kata.length <= 2) {
        const sapa = profil.nama ? profil.nama.split(' ')[0] : 'Sobat';
        fallbackText = `Siap, ${sapa}! Selamat memasak dan semoga makin hemat ya 🍳`;
      } else if (q.includes('awet') || q.includes('tahan lama') || q.includes('simpan') || q.includes('busuk')) {
        fallbackText = 'Sayur yang paling awet di kamar kos (tanpa kulkas bisa 3–7 hari): wortel, kol/kubis, kentang, labu siam, dan buncis. Simpan di tempat kering, jangan dicuci dulu sebelum dimasak. Untuk protein awet: telur, tempe, ikan teri, dan sarden.';
      } else if (/\b(halo|hai|hi|hei)\b/.test(q) && kata.length === 0) {
        const sapa = profil.nama ? profil.nama.split(' ')[0] : 'Sobat';
        fallbackText = `Hai ${sapa}! Mau tanya ide masak bahan tertentu, resep cepat, atau rekomendasi menu sesuai bujet Rp${(profil.budget || 30000).toLocaleString('id-ID')}/hari?`;
      } else if (q.includes('gizi') || q.includes('kalori') || q.includes('akg')) {
        const t = targetGizi(profil);
        fallbackText = `Target gizimu sekitar ${t.kalori.toLocaleString('id-ID')} kkal/hari (protein ${t.protein}g, karbo ${t.karbo}g, serat ${t.serat}g). Kombinasikan karbohidrat (nasi/oat) + protein murah (telur/tahu/tempe) + sayur hijau agar seimbang dan tetap hemat.`;
      } else if (q.includes('stok') || q.includes('sisa')) {
        const ide = ideasFromStock(profil).slice(0, 3);
        fallbackText = ide.length
          ? `Dari stok di kosmu (${profil.stok.join(', ')}), ini menu yang paling pas:\n` + ide.map((x, i) => `${i + 1}. ${x.recipe.nama} (${x.persen}% bahan ada, ~Rp${x.recipe.harga.toLocaleString('id-ID')})`).join('\n')
          : 'Stok bahan di kosmu masih kosong. Tambahkan bahan di halaman Cek Bahan Sisa dulu ya!';
      } else {
        const bahanTidakAda = kataCari.filter((k) => !sumberResep.some((r) => `${r.nama} ${r.bahan.map((b) => `${b.nama} ${b.kunci}`).join(' ')}`.toLowerCase().includes(k)));
        const cocok = bahanTidakAda.length ? [] : cariCocok();
        if (cocok.length > 0) {
          const mintaCara = q.includes('cara') || q.includes('gimana') || q.includes('langkah') || q.includes('bikin');
          if (mintaCara) {
            const top = cocok[0];
            fallbackText = `Resep ${top.nama} (~Rp${top.harga.toLocaleString('id-ID')}, ${top.waktu} menit):\nBahan: ${top.bahan.map((b) => `${b.nama} (${b.qty})`).join(', ')}\nLangkah:\n${top.langkah.map((l, i) => `${i + 1}. ${l}`).join('\n')}`;
          } else {
            const daftar = cocok
              .map((r, i) => `${i + 1}. ${r.nama} — Rp${r.harga.toLocaleString('id-ID')} (${r.kalori} kkal, ${r.protein}g protein, ${r.waktu} mnt)`)
              .join('\n');
            const catatanHindari = hindari.length
              ? `Oke, tanpa ${hindari.join(', ')} ya! Kamu bisa ganti dengan telur/tahu/tempe, atau pilih menu ini:\n`
              : 'Rekomendasi yang cocok buat kamu:\n';
            fallbackText = `${catatanHindari}${daftar}`;
          }
        } else if (hindari.length > 0) {
          const alt = sumberResep.slice(0, 3)
            .map((r, i) => `${i + 1}. ${r.nama} — Rp${r.harga.toLocaleString('id-ID')}`)
            .join('\n');
          fallbackText = `Oke, tanpa ${hindari.join(', ')} ya! Kamu bisa ganti dengan telur, tahu, atau tempe. Atau coba menu alternatif ini:\n${alt}`;
        } else if (kataCari.length > 0 && !q.includes('menu hari ini') && !q.includes('rekomendasi')) {
          const alatInfo = (profil.alat && profil.alat.length) ? profil.alat.join(' / ') : 'kompor atau rice cooker';
          fallbackText = `Untuk olahan ${kataCari.join(' & ')}, kamu bisa masak praktis pakai ${alatInfo}: rebus atau goreng sebentar, lalu tumis dengan bawang merah, bawang putih, cabai, dan kecap/garam. Cocok banget dimakan hangat bareng nasi dan telur dadar!`;
        } else {
          const paket = recommendDaily(profil).map(getRecipe).filter(Boolean);
          const total = paket.reduce((s, r) => s + r.harga, 0);
          fallbackText = `Ini rekomendasi menu 1 hari sesuai bujet Rp${(profil.budget || 30000).toLocaleString('id-ID')}:\n` +
            paket.map((r) => `• ${SLOT_LABEL[r.slot]}: ${r.nama} (Rp${r.harga.toLocaleString('id-ID')})`).join('\n') +
            `\nTotal: Rp${total.toLocaleString('id-ID')}`;
        }
      }
      return Response.json({ balasan: fallbackText, sumber: 'aturan' });
    }
  }

  // 2. Mode Rekomendasi Menu & Bahan Sisa
  const kandidat = allowedRecipes(profil);

  try {
    if (kandidat.length === 0) return Response.json(hasilAturan(mode, profil));
    const teks = await panggilAI(bangunPrompt(mode, profil, kandidat));
    const j = parseJson(teks);
    const ids = Array.isArray(j.ids)
      ? [...new Set(j.ids)].filter((id) => kandidat.some((r) => r.id === id))
      : [];

    if (mode === 'menu') {
      const urut = SLOTS.map((s) => ids.map(getRecipe).find((r) => r && r.slot === s)).filter(Boolean);
      if (urut.length !== 3 || nutrisiDari(urut.map((r) => r.id)).biaya > profil.budget) {
        throw new Error('Hasil AI melebihi bujet atau slot tidak lengkap');
      }
      return Response.json({
        ids: urut.map((r) => r.id),
        alasan: String(j.alasan || '').slice(0, 400),
        sumber: 'ai',
      });
    }

    if (ids.length === 0) throw new Error('Hasil AI kosong');
    return Response.json({
      ids: ids.slice(0, 3),
      alasan: String(j.alasan || '').slice(0, 400),
      sumber: 'ai',
    });
  } catch (e) {
    return Response.json(hasilAturan(mode, profil));
  }
}
