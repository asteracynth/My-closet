import { NavLink } from 'react-router-dom';
import { Home, Shirt, Layers, CalendarDays, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const navs = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/closet', label: 'Closet', icon: Shirt },
  { to: '/outfits', label: 'Outfits', icon: Layers },
  { to: '/log', label: 'Wear Log', icon: CalendarDays },
  { to: '/stats', label: 'Statistics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-lavender-100 bg-white/60 backdrop-blur min-h-screen p-5">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center text-white">
          <Shirt size={18} />
        </div>
        <div>
          <div className="font-semibold text-lavender-700 leading-tight">Personal</div>
          <div className="font-semibold text-blush-500 leading-tight">Closet</div>
        </div>
      </div>

      <ul className="space-y-1 flex-1">
        {navs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-lavender-100 text-lavender-700'
                    : 'text-lavender-500 hover:bg-lavender-50 hover:text-lavender-700',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-blush-500 hover:bg-blush-50 transition mt-4"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}
