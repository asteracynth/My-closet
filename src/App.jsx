import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast.jsx';

import SetupPage from './components/auth/SetupPage.jsx';
import LoginPage from './components/auth/LoginPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';

import Layout from './components/shared/Layout.jsx';

import DashboardPage from './components/dashboard/DashboardPage.jsx';
import ClosetPage from './components/closet/ClosetPage.jsx';
import ItemForm from './components/closet/ItemForm.jsx';
import ItemDetail from './components/closet/ItemDetail.jsx';

import OutfitsPage from './components/outfits/OutfitsPage.jsx';
import OutfitForm from './components/outfits/OutfitForm.jsx';
import OutfitDetail from './components/outfits/OutfitDetail.jsx';

import WearLogPage from './components/log/WearLogPage.jsx';
import LogForm from './components/log/LogForm.jsx';

import StatsPage from './components/stats/StatsPage.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import UsersPage from './components/admin/UsersPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/closet/add" element={<ItemForm />} />
          <Route path="/closet/:id" element={<ItemDetail />} />
          <Route path="/closet/:id/edit" element={<ItemForm />} />

          <Route path="/outfits" element={<OutfitsPage />} />
          <Route path="/outfits/add" element={<OutfitForm />} />
          <Route path="/outfits/:id" element={<OutfitDetail />} />
          <Route path="/outfits/:id/edit" element={<OutfitForm />} />

          <Route path="/log" element={<WearLogPage />} />
          <Route path="/log/add" element={<LogForm />} />

          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
