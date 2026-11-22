'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_PROFILE } from '@/lib/data';
import { recommendDaily, buildShopping } from '@/lib/recommend';

const KEY = 'nutrikos-v2';
const LEGACY_KEY = 'nutrikos-v1';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export const kunciTanggal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const hariIni = () => kunciTanggal(new Date());

const initial = () => ({
  profile: DEFAULT_PROFILE,
  plan: [],
  extra: [],
  checked: {},
  log: {},
  ai: null,
  customShoppingItems: [],
  shoppingOverrides: {},
  deletedShoppingItems: [],
  customPlanDetails: {},
  favorit: [],
});

export default function AppProvider({ children }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [triggerAiModal, setTriggerAiModal] = useState(false);

  useEffect(() => {
    try {
      let saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved) {
        // Cek migrasi dari key lama
        saved = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      }
      if (saved) {
        setState({
          ...initial(),
          ...saved,
          profile: { ...DEFAULT_PROFILE, ...saved.profile },
          customShoppingItems: saved.customShoppingItems || [],
          shoppingOverrides: saved.shoppingOverrides || {},
          deletedShoppingItems: saved.deletedShoppingItems || [],
          customPlanDetails: saved.customPlanDetails || {},
          favorit: saved.favorit || [],
        });
      } else {
        setState((s) => ({ ...s, plan: recommendDaily(s.profile) }));
      }
    } catch (e) {
      setState((s) => ({ ...s, plan: recommendDaily(s.profile) }));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state, ready]);

  // Sidebar helpers
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  // Profile
  const setProfile = useCallback((patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })), []);

  // Plan & Recipes
  const setPlan = useCallback((plan) => setState((s) => ({ ...s, plan })), []);
  const generatePlan = useCallback(() => {
    setState((s) => ({
      ...s,
      plan: recommendDaily(s.profile),
      // reset overrides jika buat plan baru
      deletedShoppingItems: [],
      customPlanDetails: {},
    }));
  }, []);

  const toggleFavorit = useCallback((id) => setState((s) => ({ ...s, favorit: s.favorit.includes(id) ? s.favorit.filter((x) => x !== id) : [...s.favorit, id] })), []);

  const addExtra = useCallback((id) => setState((s) => (s.extra.includes(id) ? s : { ...s, extra: [...s.extra, id] })), []);

  // Ganti satu resep di dalam plan
  const updateRecipeInPlan = useCallback((oldId, newId) => {
    setState((s) => {
      const idx = s.plan.indexOf(oldId);
      let newPlan = [...s.plan];
      if (idx !== -1) {
        newPlan[idx] = newId;
      } else {
        newPlan.push(newId);
      }
      // Hapus porsi khusus resep lama jika ada
      const newPlanDetails = { ...s.customPlanDetails };
      if (newPlanDetails[oldId]) {
        newPlanDetails[newId] = newPlanDetails[oldId];
        delete newPlanDetails[oldId];
      }
      return {
        ...s,
        plan: newPlan,
        customPlanDetails: newPlanDetails,
      };
    });
  }, []);

  // Hapus resep dari plan
  const removeRecipeFromPlan = useCallback((recipeId) => {
    setState((s) => {
      const newPlan = s.plan.filter((id) => id !== recipeId);
      const newExtra = s.extra.filter((id) => id !== recipeId);
      const newPlanDetails = { ...s.customPlanDetails };
      delete newPlanDetails[recipeId];
      return {
        ...s,
        plan: newPlan,
        extra: newExtra,
        customPlanDetails: newPlanDetails,
      };
    });
  }, []);

  // Tambah resep ke plan
  const addRecipeToPlan = useCallback((recipeId) => {
    setState((s) => (s.plan.includes(recipeId) ? s : { ...s, plan: [...s.plan, recipeId] }));
  }, []);

  // Set porsi resep
  const setRecipePortion = useCallback((recipeId, porsi) => {
    setState((s) => ({
      ...s,
      customPlanDetails: {
        ...s.customPlanDetails,
        [recipeId]: { ...(s.customPlanDetails[recipeId] || {}), porsi: Math.max(1, porsi) },
      },
    }));
  }, []);

  // Shopping List Management
  const getShoppingItems = useCallback(() => {
    const { profile, plan, extra, customShoppingItems, shoppingOverrides, deletedShoppingItems, customPlanDetails } = state;
    // 1. Ambil bahan dasar dari menu
    const baseItems = buildShopping(profile, [...plan, ...extra], customPlanDetails);

    // 2. Filter bahan yang dihapus, terapkan override
    const processedBaseItems = baseItems
      .filter((item) => !deletedShoppingItems.includes(item.nama))
      .map((item) => {
        const override = shoppingOverrides[item.nama];
        if (override) {
          return {
            ...item,
            ...override,
            originalNama: item.nama,
          };
        }
        return {
          ...item,
          id: `recipe-${item.nama}`,
          originalNama: item.nama,
        };
      });

    // 3. Gabungkan dengan custom item belanja
    const all = [...processedBaseItems, ...customShoppingItems];

    // 4. Set id unik jika belum ada
    return all.map((item, idx) => ({
      ...item,
      id: item.id || `item-${idx}-${item.nama}`,
    }));
  }, [state]);

  // Tambah item belanja kustom
  const addShoppingItem = useCallback((item) => {
    const newItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nama: item.nama.trim(),
      qty: item.qty?.trim() || '1 porsi',
      harga: Math.max(0, Number(item.harga) || 0),
      kat: item.kat || 'sayur',
      untuk: item.untuk?.trim() || 'Tambahan Manual',
      sudahAda: false,
      isCustom: true,
    };
    setState((s) => ({
      ...s,
      customShoppingItems: [...s.customShoppingItems, newItem],
    }));
    return newItem;
  }, []);

  // Update item belanja (baik dari resep maupun custom)
  const updateShoppingItem = useCallback((originalItem, updatedFields) => {
    setState((s) => {
      const nextChecked = { ...s.checked };

      // Jika nama berubah, pertahankan status checked
      if (updatedFields.nama && updatedFields.nama !== originalItem.nama) {
        if (nextChecked[originalItem.nama] !== undefined) {
          nextChecked[updatedFields.nama] = nextChecked[originalItem.nama];
          delete nextChecked[originalItem.nama];
        }
      }

      if (originalItem.isCustom) {
        // Update di customShoppingItems
        const updatedCustom = s.customShoppingItems.map((c) =>
          c.id === originalItem.id ? { ...c, ...updatedFields } : c
        );
        return {
          ...s,
          customShoppingItems: updatedCustom,
          checked: nextChecked,
        };
      } else {
        // Item berasal dari resep -> simpan override berdasarkan nama asli resep
        const key = originalItem.originalNama || originalItem.nama;
        const newOverrides = {
          ...s.shoppingOverrides,
          [key]: {
            ...(s.shoppingOverrides[key] || {}),
            ...updatedFields,
          },
        };
        return {
          ...s,
          shoppingOverrides: newOverrides,
          checked: nextChecked,
        };
      }
    });
  }, []);

  // Hapus item belanja
  const deleteShoppingItem = useCallback((item) => {
    setState((s) => {
      if (item.isCustom) {
        return {
          ...s,
          customShoppingItems: s.customShoppingItems.filter((c) => c.id !== item.id),
        };
      } else {
        const key = item.originalNama || item.nama;
        return {
          ...s,
          deletedShoppingItems: s.deletedShoppingItems.includes(key)
            ? s.deletedShoppingItems
            : [...s.deletedShoppingItems, key],
        };
      }
    });
  }, []);

  // Checklist
  const toggleChecked = useCallback((nama) => {
    setState((s) => ({
      ...s,
      checked: { ...s.checked, [nama]: !s.checked[nama] },
    }));
  }, []);

  const setChecked = useCallback((checked) => setState((s) => ({ ...s, checked })), []);

  const markAllShoppingBought = useCallback((items) => {
    setState((s) => {
      const nextChecked = { ...s.checked };
      items.forEach((x) => {
        if (!x.sudahAda) nextChecked[x.nama] = true;
      });
      return { ...s, checked: nextChecked };
    });
  }, []);

  const unmarkAllShoppingBought = useCallback((items) => {
    setState((s) => {
      const nextChecked = { ...s.checked };
      items.forEach((x) => {
        nextChecked[x.nama] = false;
      });
      return { ...s, checked: nextChecked };
    });
  }, []);

  const setAi = useCallback((ai) => setState((s) => ({ ...s, ai })), []);
  const logToday = useCallback(() => setState((s) => ({ ...s, log: { ...s.log, [hariIni()]: s.plan } })), []);
  const reset = useCallback(() => {
    const p = DEFAULT_PROFILE;
    setState({
      profile: p,
      plan: recommendDaily(p),
      extra: [],
      checked: {},
      log: {},
      ai: null,
      customShoppingItems: [],
      shoppingOverrides: {},
      deletedShoppingItems: [],
      customPlanDetails: {},
      favorit: [],
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        ...state,
        ready,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setProfile,
        setPlan,
        generatePlan,
        addExtra,
        toggleFavorit,
        updateRecipeInPlan,
        removeRecipeFromPlan,
        addRecipeToPlan,
        setRecipePortion,
        getShoppingItems,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        toggleChecked,
        setChecked,
        markAllShoppingBought,
        unmarkAllShoppingBought,
        logToday,
        reset,
        setAi,
        triggerAiModal,
        setTriggerAiModal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
