// Menyampaikan status simpan ke label kecil di pojok layar (ditampilkan oleh SesiSync).
export function laporSync(status) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nutrikos-sync', { detail: status }));
}
