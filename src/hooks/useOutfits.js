import { useCallback, useEffect, useState } from 'react';
import {
  getAllOutfits,
  createOutfit as dbCreate,
  updateOutfit as dbUpdate,
  deleteOutfit as dbDelete,
} from '../db/outfitsDB.js';

export function useOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setOutfits(await getAllOutfits());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addOutfit = useCallback(async (data) => {
    const o = await dbCreate(data);
    await refresh();
    return o;
  }, [refresh]);

  const editOutfit = useCallback(async (id, patch) => {
    const o = await dbUpdate(id, patch);
    await refresh();
    return o;
  }, [refresh]);

  const removeOutfit = useCallback(async (id) => {
    await dbDelete(id);
    await refresh();
  }, [refresh]);

  return { outfits, loading, refresh, addOutfit, editOutfit, removeOutfit };
}
