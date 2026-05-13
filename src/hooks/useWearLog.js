import { useCallback, useEffect, useState } from 'react';
import {
  getAllWearLogs,
  createWearLog as dbCreate,
  deleteWearLog as dbDelete,
} from '../db/wearLogDB.js';

export function useWearLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await getAllWearLogs());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addLog = useCallback(async (data) => {
    const log = await dbCreate(data);
    await refresh();
    return log;
  }, [refresh]);

  const removeLog = useCallback(async (id) => {
    await dbDelete(id);
    await refresh();
  }, [refresh]);

  return { logs, loading, refresh, addLog, removeLog };
}
