
import React from 'react';
// This is a placeholder for a very complex CRUD page.
import { useI18n } from '../../contexts/I18nContext';
import { useData } from '../../contexts/DataContext';

const ExpensesPage: React.FC = () => {
    const { t } = useI18n();
    const { expenses } = useData();
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">{t('expenses')}</h1>
                <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">{t('addExpense')}</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('expenseHistory')}</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">{t('date')}</th>
                                <th className="p-2">{t('expenseCategory')}</th>
                                <th className="p-2">{t('amount')}</th>
                                <th className="p-2">{t('note')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(exp => (
                                <tr key={exp.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{new Date(exp.createdAt).toLocaleDateString()}</td>
                                    <td className="p-2">{exp.category}</td>
                                    <td className="p-2">{exp.amount.toFixed(2)} {t('currency')}</td>
                                    <td className="p-2">{exp.note}</td>
                                </tr>
                            ))}
                             {expenses.length === 0 && (
                                <tr><td colSpan={4} className="text-center p-4 text-gray-500">No expenses recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="mt-8 text-center text-gray-500">Expense adding functionality would be implemented here with a form inside a modal.</p>
        </div>
    );
};

export default ExpensesPage;
