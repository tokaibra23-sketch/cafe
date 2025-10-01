
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToasts } from '../../hooks/useToasts';

const AdminLayout: React.FC = () => {
    const { t, dir } = useI18n();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { showToast } = useToasts();

    const navItems = [
        { to: 'reports', label: 'reports', icon: '📊' },
        { to: 'reservations', label: 'reservations', icon: '🗓️' },
        { to: 'menu', label: 'menuManagement', icon: '🧾' },
        { to: 'users', label: 'userManagement', icon: '👥' },
        { to: 'expenses', label: 'expenses', icon: '💸' },
        { to: 'settings', label: 'settings', icon: '⚙️' },
    ];

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        } else {
            if (result.reason === 'activeShiftError') {
                showToast(t('closeShiftBeforeLogout'), 'error');
                navigate('/shift');
            } else {
                showToast('Logout failed.', 'error');
            }
        }
    };

    return (
        <div className="flex h-screen bg-brand-light" dir={dir}>
            <aside className={`bg-brand-primary text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-4 flex items-center justify-center h-16 border-b border-brand-secondary">
                    <span className="text-2xl font-bold whitespace-nowrap">{isSidebarOpen ? 'Velva Café' : '☕'}</span>
                </div>
                <nav className="mt-4">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center py-3 px-6 my-1 transition-colors ${
                                isActive ? 'bg-brand-secondary text-white' : 'hover:bg-brand-secondary/50'
                                }`
                            }
                        >
                            <span className="text-2xl">{item.icon}</span>
                            {isSidebarOpen && <span className="mx-4 font-medium">{t(item.label)}</span>}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm flex justify-between items-center p-4">
                     <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100">
                        ☰
                    </button>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <NavLink to="/pos" className="text-sm font-medium text-brand-secondary hover:text-brand-primary">{t('pos')}</NavLink>
                        <span>Welcome, {user?.name}</span>
                        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-100 text-brand-danger">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
