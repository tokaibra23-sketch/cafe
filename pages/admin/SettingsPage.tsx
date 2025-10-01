
import React, { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useData } from '../../contexts/DataContext';
import { useToasts } from '../../hooks/useToasts';
import { CafeSettings } from '../../types';

const SettingsPage: React.FC = () => {
    const { t } = useI18n();
    const { settings, updateSettings } = useData();
    const { showToast } = useToasts();
    const [formData, setFormData] = useState<CafeSettings>(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings(formData);
        showToast(t('settingsUpdated'), 'success');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-brand-primary">{t('cafeSettings')}</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('cafeName')}</label>
                        <input type="text" name="cafeName" value={formData.cafeName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('logoUrl')}</label>
                        <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('taxRate')}</label>
                            <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('serviceChargeRate')}</label>
                            <input type="number" name="serviceChargeRate" value={formData.serviceChargeRate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('receiptFooter')}</label>
                        <textarea name="receiptFooter" value={formData.receiptFooter} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('receiptFooterAr')}</label>
                        <textarea name="receiptFooterAr" value={formData.receiptFooterAr} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none">
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
