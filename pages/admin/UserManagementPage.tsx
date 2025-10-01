
import React from 'react';
// This is a placeholder for a very complex CRUD page.
import { useI18n } from '../../contexts/I18nContext';
import { useData } from '../../contexts/DataContext';

const UserManagementPage: React.FC = () => {
  const { t } = useI18n();
  const { users } = useData();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-primary">{t('userManagement')}</h1>
        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">{t('addUser')}</button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b">
                    <th className="p-2">{t('fullName')}</th>
                    <th className="p-2">{t('username')}</th>
                    <th className="p-2">{t('role')}</th>
                    <th className="p-2">{t('active')}</th>
                    <th className="p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{t(`role_${user.role}`)}</td>
                        <td className="p-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${user.active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {user.active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="p-2 space-x-2">
                             <button className="text-blue-600 hover:underline">{t('edit')}</button>
                             <button className="text-red-600 hover:underline">{t('delete')}</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <p className="mt-8 text-center text-gray-500">Full CRUD functionality for Users would be implemented here with forms inside modals.</p>
    </div>
  );
};

export default UserManagementPage;
