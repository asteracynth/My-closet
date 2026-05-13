import { Sparkles } from 'lucide-react';

export default function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-lavender-100 flex items-center justify-center mb-3">
        <Icon className="text-lavender-600" size={28} />
      </div>
      <h3 className="font-semibold text-lavender-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-lavender-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
