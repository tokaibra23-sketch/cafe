
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useData } from '../../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsPage: React.FC = () => {
  const { t } = useI18n();
  // FIX: Separated the merged line into two correct statements.
  const { orders, menuItems } = useData();
  const itemPopularity = React.useMemo(() => {
    const itemCounts: { [key: number]: { name: string, quantity: number, revenue: number } } = {};
    menuItems.forEach(mi => {
        itemCounts[mi.id] = { name: mi.name, quantity: 0, revenue: 0 };
    });

    orders.forEach(order => {
        order.items.forEach(item => {
            if (itemCounts[item.menuItemId]) {
                itemCounts[item.menuItemId].quantity += item.quantity;
                itemCounts[item.menuItemId].revenue += item.lineTotal;
            }
        });
    });

    return Object.values(itemCounts);
  }, [orders, menuItems]);

  const topItemsByQuantity = [...itemPopularity].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const topItemsByRevenue = [...itemPopularity].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  
  // Dummy data for daily sales
  const dailySalesData = [
      { name: 'Sun', sales: 4000 }, { name: 'Mon', sales: 3000 }, { name: 'Tue', sales: 2000 },
      { name: 'Wed', sales: 2780 }, { name: 'Thu', sales: 1890 }, { name: 'Fri', sales: 2390 },
      { name: 'Sat', sales: 3490 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-brand-primary">{t('reports')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('dailySalesReport')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#4a3f35" name={t('revenue')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('itemPopularityReport')} ({t('byQuantity')})</h2>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItemsByQuantity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#a28b7a" name={t('totalSold')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('itemPopularityReport')} ({t('byRevenue')})</h2>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItemsByRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4a3f35" name={t('revenue')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
