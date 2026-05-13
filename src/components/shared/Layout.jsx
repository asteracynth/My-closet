import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import ToastViewport from './Toast.jsx';
import StorageWarning from './StorageWarning.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <StorageWarning />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <ToastViewport />
    </div>
  );
}
