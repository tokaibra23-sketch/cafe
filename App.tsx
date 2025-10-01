
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import KitchenPage from './pages/KitchenPage';
import AdminLayout from './pages/admin/AdminLayout';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ShiftManagementPage from './pages/ShiftManagementPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import { Role } from './types';
import ToastContainer from './components/ToastContainer';

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: Role[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

const CashierRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, activeShift } = useAuth();
    if (!user) {
        return <Navigate to="/login" />;
    }
    if (user.role !== Role.Cashier && user.role !== Role.Admin) {
        return <Navigate to="/" />;
    }
    if (!activeShift) {
        return <Navigate to="/shift" />;
    }
    return children;
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<LanguageSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shift" element={
                <ProtectedRoute roles={[Role.Admin, Role.Cashier]}>
                    <ShiftManagementPage />
                </ProtectedRoute>
            } />
            <Route path="/pos" element={
                <CashierRoute>
                    <POSPage />
                </CashierRoute>
            } />
            <Route path="/kitchen" element={
                <ProtectedRoute roles={[Role.Admin, Role.Kitchen]}>
                    <KitchenPage />
                </ProtectedRoute>
            } />
            <Route path="/admin" element={
                <ProtectedRoute roles={[Role.Admin]}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="reports" />} />
                <Route path="menu" element={<MenuManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
            </Route>
            <Route path="*" element={<Navigate to={user ? (user.role === Role.Admin ? '/admin' : user.role === Role.Cashier ? '/pos' : '/kitchen') : '/'} />} />
        </Routes>
    );
}

const App = () => {
  return (
    <I18nProvider>
        <DataProvider>
            <AuthProvider>
                <HashRouter>
                    <div className="bg-brand-light min-h-screen font-sans text-brand-primary">
                        <AppRoutes />
                    </div>
                    <ToastContainer />
                </HashRouter>
            </AuthProvider>
        </DataProvider>
    </I18nProvider>
  );
};

export default App;
