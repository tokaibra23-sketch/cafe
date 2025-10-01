
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useData } from '../contexts/DataContext';
import { PaymentMethod } from '../types';
import { useToasts } from '../hooks/useToasts';

const ShiftManagementPage: React.FC = () => {
    const { user, activeShift, openShift, closeShift, logout } = useAuth();
    const { t, dir } = useI18n();
    const navigate = useNavigate();
    const [cashAmount, setCashAmount] = useState('');
    const [error, setError] = useState('');
    const { orders, expenses, shifts } = useData();
    const { showToast } = useToasts();

    useEffect(() => {
        if (!activeShift) {
            const lastClosedShift = shifts
                .filter(s => s.closedAt)
                .sort((a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime())[0];
            
            if (lastClosedShift && lastClosedShift.closingCash !== null) {
                setCashAmount(lastClosedShift.closingCash.toString());
            }
        }
    }, [activeShift, shifts]);

    const handleOpenShift = async () => {
        const amount = parseFloat(cashAmount);
        if (isNaN(amount) || amount < 0) {
            setError('Please enter a valid positive number.');
            return;
        }
        await openShift(amount);
        navigate('/pos');
    };

    const handleCloseShift = async () => {
        const amount = parseFloat(cashAmount);
        if (isNaN(amount) || amount < 0) {
            setError('Please enter a valid positive number.');
            return;
        }
        await closeShift(amount);
        const result = await logout();
        if (result.success) {
            navigate('/login');
        } else {
            showToast('Logout failed.', 'error');
        }
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        } else {
            if (result.reason === 'activeShiftError') {
                showToast(t('closeShiftBeforeLogout'), 'error');
            } else {
                showToast('Logout failed.', 'error');
            }
        }
    };

    const getShiftSummary = () => {
        if (!activeShift) return { calculatedCash: 0, difference: 0 };

        const shiftOrders = orders.filter(o => o.shiftId === activeShift.id);
        const cashPayments = shiftOrders
            .flatMap(o => o.payments)
            .filter(p => p.method === PaymentMethod.Cash)
            .reduce((sum, p) => sum + p.amount, 0);

        const shiftExpenses = expenses.filter(e => e.shiftId === activeShift.id);
        const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);

        const calculatedCash = activeShift.openingCash + cashPayments - totalExpenses;
        const closingAmount = parseFloat(cashAmount) || 0;
        const difference = closingAmount - calculatedCash;
        
        return { calculatedCash, difference };
    }

    const { calculatedCash, difference } = getShiftSummary();

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light p-4" dir={dir}>
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-brand-primary">{user?.name}</h1>
                    <p className="text-brand-secondary">{activeShift ? t('endShift') : t('startShift')}</p>
                </div>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {activeShift ? (
                    // Close Shift View
                    <div>
                        <div className="mb-4 p-4 bg-gray-100 rounded">
                            <div className="flex justify-between"><span>{t('openingCash')}:</span><span>{activeShift.openingCash.toFixed(2)} {t('currency')}</span></div>
                            <div className="flex justify-between font-bold"><span>{t('calculatedCash')}:</span><span>{calculatedCash.toFixed(2)} {t('currency')}</span></div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-brand-primary text-sm font-bold mb-2">{t('closingCash')}</label>
                            <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="0.00"
                            />
                        </div>
                        {cashAmount && <div className={`flex justify-between font-bold p-2 rounded ${difference === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <span>{t('difference')}:</span>
                            <span>{difference.toFixed(2)} {t('currency')}</span>
                        </div>}
                        <button
                            onClick={handleCloseShift}
                            className="w-full mt-4 bg-brand-danger hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            {t('closeShift')} & {t('logout')}
                        </button>
                    </div>
                ) : (
                    // Open Shift View
                    <div>
                        <div className="mb-4">
                            <label className="block text-brand-primary text-sm font-bold mb-2">{t('startingCash')}</label>
                            <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleOpenShift}
                            className="w-full bg-brand-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            {t('openShift')}
                        </button>
                    </div>
                )}
                 <button 
                    onClick={handleLogout} 
                    className="w-full mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};

export default ShiftManagementPage;
