import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = ++_id;
    const ttl = type === 'error' ? 5000 : 3000;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => remove(id), ttl);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ push, remove, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
