
import React, { useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../contexts/I18nContext';
import { Order, OrderStatus, KitchenStatus, OrderType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../hooks/useToasts';

const KitchenOrderCard: React.FC<{ order: Order; onUpdateStatus: (orderId: number, newStatus: KitchenStatus) => void; }> = ({ order, onUpdateStatus }) => {
    const { t, language } = useI18n();

    const getStatusColor = (status: KitchenStatus) => {
        switch (status) {
            case KitchenStatus.New: return 'bg-red-500';
            case KitchenStatus.Preparing: return 'bg-yellow-500';
            case KitchenStatus.Ready: return 'bg-green-500';
        }
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "min";
        return Math.floor(seconds) + "s";
    }

    return (
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
            <div className={`p-3 rounded-t-lg text-white font-bold flex justify-between ${getStatusColor(order.kitchenStatus)}`}>
                <div>
                    {order.type === OrderType.Table ? `${t('table')} ${order.tableNo}` : t('takeaway')} - #{order.id % 1000}
                </div>
                <div>{timeSince(order.openedAt)}</div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                <ul className="space-y-2">
                    {order.items.map(item => (
                        <li key={item.id} className="border-b pb-2">
                            <div className="font-semibold text-lg">
                                <span className="inline-block bg-brand-primary text-white rounded-full text-sm w-6 h-6 text-center leading-6 mr-2 rtl:ml-2 rtl:mr-0">{item.quantity}</span>
                                {language === 'ar' ? item.nameAr : item.name}
                            </div>
                            {item.modifiers.length > 0 && (
                                <div className="text-xs text-gray-500 ps-8 rtl:pr-8">
                                    {item.modifiers.map(mod => `+ ${language === 'ar' ? mod.nameAr : mod.name}`).join(', ')}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-2 border-t mt-auto">
                {order.kitchenStatus === KitchenStatus.New && (
                    <button onClick={() => onUpdateStatus(order.id, KitchenStatus.Preparing)} className="w-full py-2 bg-yellow-500 text-white font-bold rounded">
                        {t('markPreparing')}
                    </button>
                )}
                {order.kitchenStatus === KitchenStatus.Preparing && (
                    <button onClick={() => onUpdateStatus(order.id, KitchenStatus.Ready)} className="w-full py-2 bg-green-500 text-white font-bold rounded">
                        {t('markReady')}
                    </button>
                )}
            </div>
        </div>
    );
};

const KitchenPage: React.FC = () => {
    const { orders, updateOrder, settings, refreshData } = useData();
    const { t, dir } = useI18n();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToasts();

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 5000); // Poll for new orders every 5 seconds
        return () => clearInterval(interval);
    }, [refreshData]);

    const activeOrders = useMemo(() => {
        return orders
            .filter(o => o.status !== OrderStatus.Paid && o.kitchenStatus !== KitchenStatus.Ready)
            .sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
    }, [orders]);
    
    const readyOrders = useMemo(() => {
        return orders
            .filter(o => o.kitchenStatus === KitchenStatus.Ready)
            .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
            .slice(0, 10); // Show last 10 ready orders
    }, [orders]);

    const handleUpdateStatus = async (orderId: number, newStatus: KitchenStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            await updateOrder({ ...order, kitchenStatus: newStatus });
        }
    };
    
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
        <div className="h-screen w-screen flex flex-col bg-brand-light" dir={dir}>
            <header className="bg-white shadow-md p-2 flex justify-between items-center text-brand-primary">
                <div className="flex items-center">
                    <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 mr-3 rtl:ml-3"/>
                    <h1 className="text-xl font-bold">{t('kitchenDisplay')}</h1>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-100 text-brand-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </header>
            <main className="flex-grow p-4 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
                    {activeOrders.map(order => (
                        <KitchenOrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                    ))}
                    {activeOrders.length === 0 && (
                        <div className="col-span-full flex items-center justify-center text-2xl text-gray-400">
                            No active orders.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default KitchenPage;
