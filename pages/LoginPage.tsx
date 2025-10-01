
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Role } from '../types';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, dir } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      if (user) {
        if(user.role === Role.Admin) {
            navigate('/admin');
        } else if (user.role === Role.Cashier) {
            navigate('/shift');
        } else if (user.role === Role.Kitchen) {
            navigate('/kitchen');
        }
      } else {
        setError('invalidCredentials');
      }
    } catch (err: any) {
        if(err.message === 'accountInactive'){
            setError('accountInactive');
        } else {
            setError('invalidCredentials');
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-primary p-4" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center text-brand-light mb-8">
            <h1 className="text-4xl font-bold mb-2">☕ Velva Café</h1>
            <p className="text-lg text-brand-accent">{t('login')}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-brand-light shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4">
          {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">{t(error)}</p>}
          <div className="mb-4">
            <label className="block text-brand-primary text-sm font-bold mb-2" htmlFor="username">
              {t('username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-brand-primary text-sm font-bold mb-2" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              {t('login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
