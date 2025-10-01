
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { Language } from '../types';

const LanguageSelectionPage: React.FC = () => {
  const { setLanguage, t } = useI18n();
  const navigate = useNavigate();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary p-4">
        <div className="text-center text-brand-light mb-12">
            <h1 className="text-5xl font-bold mb-2">☕ Velva Café</h1>
            <p className="text-xl text-brand-accent">{t('welcome')}</p>
        </div>
        <div className="bg-brand-light p-8 rounded-xl shadow-2xl text-center">
            <h2 className="text-2xl font-semibold text-brand-primary mb-6">{t('selectLanguage')}</h2>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => handleSelectLanguage(Language.EN)}
                    className="px-8 py-4 bg-brand-secondary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary transition-all duration-300 transform hover:scale-105"
                >
                    {t('english')}
                </button>
                <button
                    onClick={() => handleSelectLanguage(Language.AR)}
                    className="px-8 py-4 bg-brand-secondary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary transition-all duration-300 transform hover:scale-105"
                >
                    {t('arabic')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default LanguageSelectionPage;
