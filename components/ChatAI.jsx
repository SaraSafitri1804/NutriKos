'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { useApp } from './AppProvider';
import { chatAI } from '@/lib/ai';

const CONTOH_PERTANYAAN = [
  'Menu tinggi protein bujet Rp25.000?',
  'Ide masakan cuma pakai rice cooker',
  'Punya telur dan nasi sisa enaknya dimasak apa?',
  'Sayur apa yang paling awet di kamar kos?',
];

const UKURAN_DEFAULT = { w: 420, h: 560 };
const STORAGE_KEY_UKURAN = 'nutrikos_chatai_size';

export default function ChatAI() {
  const { profile } = useApp();
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const [diperbesar, setDiperbesar] = useState(false);
  const [ukuran, setUkuran] = useState(UKURAN_DEFAULT);
  const [sedangResize, setSedangResize] = useState(false);
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const dragStateRef = useRef(null);
  const namaDepan = profile?.nama?.split(' ')[0] || 'Sobat';

  // Muat ukuran tersimpan dari localStorage saat client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UKURAN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.w === 'number' && typeof parsed?.h === 'number') {
          setUkuran({
            w: Math.max(320, Math.min(parsed.w, window.innerWidth - 48)),
            h: Math.max(380, Math.min(parsed.h, window.innerHeight - 48)),
          });
        }
      }
    } catch {}
  }, []);

  // Tangani drag-to-resize dari tepi kiri, atas, atau sudut kiri-atas
  useEffect(() => {
    if (!sedangResize) return;

    const handleMove = (e) => {
      const state = dragStateRef.current;
      if (!state) return;

      const maxW = Math.max(360, window.innerWidth - 48);
      const maxH = Math.max(420, window.innerHeight - 48);

      setUkuran((prev) => {
        let nextW = prev.w;
        let nextH = prev.h;

        if (state.arah === 'kiri' || state.arah === 'pojok') {
          const deltaX = state.startX - e.clientX;
          nextW = Math.round(Math.max(320, Math.min(maxW, state.startW + deltaX)));
        }
        if (state.arah === 'atas' || state.arah === 'pojok') {
          const deltaY = state.startY - e.clientY;
          nextH = Math.round(Math.max(380, Math.min(maxH, state.startH + deltaY)));
        }
        return { w: nextW, h: nextH };
      });
    };

    const handleUp = () => {
      setSedangResize(false);
      dragStateRef.current = null;
      setUkuran((current) => {
        try {
          localStorage.setItem(STORAGE_KEY_UKURAN, JSON.stringify(current));
        } catch {}
        return current;
      });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [sedangResize]);

  const mulaiResize = (arah, e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    const startW = rect ? rect.width : ukuran.w;
    const startH = rect ? rect.height : ukuran.h;

    if (diperbesar) {
      setDiperbesar(false);
      setUkuran({ w: Math.round(startW), h: Math.round(startH) });
    }

    dragStateRef.current = {
      arah,
      startX: e.clientX,
      startY: e.clientY,
      startW,
      startH,
    };
    setSedangResize(true);
  };

  // Otomatis tutup jendela chat saat berpindah halaman agar tidak menutupi tampilan
  useEffect(() => {
    setBuka(false);
  }, [pathname]);
  const [daftarPesan, setDaftarPesan] = useState([
    {
      pengirim: 'ai',
      teks: `Eh ${namaDepan}! Ada yang bisa gue bantu? Mau cari ide masak dari bahan yang ada, ngitung bujet makan, atau butuh tips hemat lainnya? 🍳`,
    },
  ]);

  const akhirPesanRef = useRef(null);

  useEffect(() => {
    setDaftarPesan([
      {
        pengirim: 'ai',
        teks: `Eh ${namaDepan}! Ada yang bisa gue bantu? Mau cari ide masak dari bahan yang ada, ngitung bujet makan, atau butuh tips hemat lainnya? 🍳`,
      },
    ]);
  }, [profile?.akunId]);

  useEffect(() => {
    setDaftarPesan((prev) => {
      if (!prev.length || prev[0].pengirim !== 'ai') return prev;
      const sapaan = `Eh ${namaDepan}! Ada yang bisa gue bantu? Mau cari ide masak dari bahan yang ada, ngitung bujet makan, atau butuh tips hemat lainnya? 🍳`;
      if (prev[0].teks === sapaan) return prev;
      return [{ ...prev[0], teks: sapaan }, ...prev.slice(1)];
    });
  }, [namaDepan]);

  useEffect(() => {
    if (buka) {
      akhirPesanRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [daftarPesan, buka]);

  const kirimPesan = async (teksKirim) => {
    const inputTeks = (teksKirim || pesan).trim();
    if (!inputTeks || loading) return;

    const pesanBaru = [...daftarPesan, { pengirim: 'user', teks: inputTeks }];
    setDaftarPesan(pesanBaru);
    setPesan('');
    setLoading(true);

    // Susun riwayat (tanpa pesan selamat datang pertama) untuk konteks AI
    const riwayatKirim = daftarPesan
      .slice(1) // skip greeting awal
      .map((m) => ({ dari: m.pengirim === 'user' ? 'user' : 'ai', teks: m.teks }));

    const res = await chatAI(inputTeks, profile, riwayatKirim);
    setDaftarPesan([
      ...pesanBaru,
      {
        pengirim: 'ai',
        teks: res.balasan || 'Maaf, saya belum bisa memproses jawaban saat ini. Coba lagi ya!',
        sumber: res.sumber,
      },
    ]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        {!buka && (
          <button
            onClick={() => setBuka(true)}
            aria-label="Buka Chat Asisten AI NutriKos"
            className="group flex items-center gap-2 rounded-full bg-brand-dark px-4 py-3 text-white shadow-xl hover:bg-brand-deeper transition-all duration-200 hover:scale-105 active:scale-95 ring-4 ring-brand-mint/40"
          >
            <div className="relative">
              <Sparkles size={20} className="text-accent animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            </div>
            <span className="text-sm font-extrabold tracking-wide">Tanya AI</span>
          </button>
        )}
      </div>

      {/* Backdrop di Mobile saat chat terbuka */}
      {buka && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setBuka(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Window Panel */}
      {buka && (
        <div
          ref={panelRef}
          style={{
            '--chat-w': diperbesar ? 'min(760px, calc(100vw - 3rem))' : `${ukuran.w}px`,
            '--chat-h': diperbesar ? 'min(820px, calc(100vh - 4rem))' : `${ukuran.h}px`,
          }}
          className={`fixed inset-x-0 bottom-0 top-12 sm:top-auto sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex w-full sm:w-[var(--chat-w)] flex-col sm:h-[var(--chat-h)] sm:max-h-[92vh] sm:max-w-[calc(100vw-3rem)] rounded-t-[2rem] sm:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-6 ${
            sedangResize ? 'select-none transition-none' : 'duration-200 transition-[width,height]'
          }`}
        >
          {/* Handle Resize Desktop: Tepi Kiri, Tepi Atas, & Sudut Kiri-Atas */}
          <div
            onPointerDown={(e) => mulaiResize('kiri', e)}
            title="Geser untuk ubah lebar"
            className="hidden sm:block absolute left-0 top-4 bottom-4 w-2 cursor-ew-resize z-20 hover:bg-brand-mint/30 transition-colors"
          />
          <div
            onPointerDown={(e) => mulaiResize('atas', e)}
            title="Geser untuk ubah tinggi"
            className="hidden sm:block absolute top-0 left-4 right-4 h-2 cursor-ns-resize z-20 hover:bg-brand-mint/30 transition-colors"
          />
          <div
            onPointerDown={(e) => mulaiResize('pojok', e)}
            title="Geser sudut untuk ubah ukuran"
            className="hidden sm:flex items-center justify-center absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-30 group"
          >
            <span className="h-2 w-2 rounded-tl-md border-t-2 border-l-2 border-white/60 group-hover:border-white transition-colors" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-dark to-brand-deeper px-4 py-3.5 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-accent backdrop-blur-xs">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm leading-none">NutriKos AI</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[11px] text-brand-mint font-medium mt-0.5">
                  Konsultan Gizi & Bujet Kos
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDiperbesar((prev) => !prev)}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label={diperbesar ? 'Perkecil Chat' : 'Perbesar Chat'}
                title={diperbesar ? 'Perkecil tampilan AI' : 'Perbesar tampilan AI'}
              >
                {diperbesar ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Tutup Chat"
                title="Tutup Chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
            <div className="flex gap-1.5 text-[11px]">
              {CONTOH_PERTANYAAN.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => kirimPesan(q)}
                  className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-brand-dark hover:text-brand-dark transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-surface text-sm">
            {daftarPesan.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.pengirim === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.pengirim === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark text-xs font-bold mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    m.pengirim === 'user'
                      ? 'bg-brand-dark text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.teks}</p>
                  {m.sumber === 'ai' && (
                    <div className="mt-1 text-[9px] font-bold text-brand-dark uppercase tracking-wider">
                      ✓ Dijawab oleh Gemini AI
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-brand-dark font-bold">
                  🤖
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-3 py-2 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-dark animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-dark animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-dark animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-500 ml-1">NutriKos AI sedang berpikir...</span>
                </div>
              </div>
            )}
            <div ref={akhirPesanRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                kirimPesan();
              }}
              className="flex items-center gap-2"
            >
              <input
                className="input !py-2.5 !text-sm flex-1 bg-slate-50 focus:bg-white"
                placeholder="Tanya resep hemat, bujet, gizi..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !pesan.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white hover:bg-brand-deeper disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
