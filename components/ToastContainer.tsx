
import React from 'react';
import { useToasts } from '../hooks/useToasts';
import { useI18n } from '../contexts/I18nContext';

const Toast: React.FC<{ toast: { id: number; message: string; type: 'success' | 'error' }; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const { t } = useI18n();
    const bgColor = toast.type === 'success' ? 'bg-brand-success' : 'bg-brand-danger';
    const Icon = toast.type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className={`flex items-center text-white p-4 rounded-lg shadow-lg ${bgColor} animate-fade-in-down`}>
            <div className="flex-shrink-0">{Icon}</div>
            <div className="mx-3 text-sm font-medium">{t(toast.message)}</div>
            <button onClick={() => onDismiss(toast.id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToasts();
    const { dir } = useI18n();

    if (!toasts.length) return null;

    return (
        <div className={`fixed top-5 w-full max-w-xs sm:max-w-sm z-50 space-y-4 ${dir === 'rtl' ? 'left-5' : 'right-5'}`}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
