import { NavLink } from 'react-router-dom';
import { Home, Shirt, Layers, CalendarDays, BarChart3, Settings } from 'lucide-react';

const navs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/closet', label: 'Closet', icon: Shirt },
  { to: '/outfits', label: 'Outfits', icon: Layers },
  { to: '/log', label: 'Log', icon: CalendarDays },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/90 backdrop-blur border-t border-lavender-100">
      <ul className="flex items-center justify-around px-1 py-1.5">
        {navs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all duration-200',
                  isActive ? 'text-lavender-600' : 'text-lavender-400 hover:text-lavender-600',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      'p-1.5 rounded-xl transition ' +
                      (isActive ? 'bg-lavender-100' : '')
                    }
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
