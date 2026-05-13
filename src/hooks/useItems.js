import { useCallback, useEffect, useState } from 'react';
import {
  getAllItems,
  createItem as dbCreate,
  updateItem as dbUpdate,
  deleteItem as dbDelete,
} from '../db/itemsDB.js';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllItems();
      setItems(all);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (data) => {
    const item = await dbCreate(data);
    await refresh();
    return item;
  }, [refresh]);

  const editItem = useCallback(async (id, patch) => {
    const item = await dbUpdate(id, patch);
    await refresh();
    return item;
  }, [refresh]);

  const removeItem = useCallback(async (id) => {
    await dbDelete(id);
    await refresh();
  }, [refresh]);

  return { items, loading, error, refresh, addItem, editItem, removeItem };
}
