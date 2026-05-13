import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, backTo, actions }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      {backTo !== undefined && (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="p-2 rounded-2xl bg-white border border-lavender-100 text-lavender-600 hover:bg-lavender-50"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-lavender-700 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-lavender-500 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
