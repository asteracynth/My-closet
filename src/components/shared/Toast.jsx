import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast.jsx';

export default function ToastViewport() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50 space-y-2 px-2 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const Icon = isError ? XCircle : CheckCircle2;
        return (
          <div
            key={t.id}
            className={
              'animate-slide-in flex items-start gap-2 rounded-2xl px-4 py-3 shadow-soft border ' +
              (isError
                ? 'bg-blush-50 border-blush-200 text-blush-700'
                : 'bg-sage-50 border-sage-200 text-sage-700')
            }
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <div className="text-sm flex-1">{t.message}</div>
            <button
              onClick={() => remove(t.id)}
              className="text-current opacity-60 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
