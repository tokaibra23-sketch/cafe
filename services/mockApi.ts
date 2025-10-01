
import { Role, OrderType, OrderStatus, KitchenStatus, PaymentMethod } from '../types';

export const DB_KEY = 'velva_cafe_db';

// This is a simple hash function for demonstration. 
// In a real app, use a robust library like bcrypt.
const simpleHashSync = (password: string): string => {
    // This is a weak, synchronous "hash" for seeding.
    // The actual login uses an async crypto API.
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    // A simplified way to get a hex-like string
    return '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // Example fixed hash for seeding
};


export const seedData = () => ({
  users: [
    { id: 1, name: 'Admin User', username: 'admin', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', role: Role.Admin, active: true },
    { id: 2, name: 'Cashier One', username: 'cashier', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', role: Role.Cashier, active: true },
    { id: 3, name: 'Kitchen Staff', username: 'kitchen', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', role: Role.Kitchen, active: true },
  ],
  categories: [
    { id: 1, name: 'Hot Drinks', nameAr: 'مشروبات ساخنة' },
    { id: 2, name: 'Cold Drinks', nameAr: 'مشروبات باردة' },
    { id: 3, name: 'Desserts', nameAr: 'حلويات' },
  ],
  modifiers: [
    { id: 1, name: 'Extra Shot', nameAr: 'شوت إضافي', priceDelta: 10, active: true },
    { id: 2, name: 'Soy Milk', nameAr: 'حليب صويا', priceDelta: 5, active: true },
    { id: 3, name: 'Whipped Cream', nameAr: 'كريمة مخفوقة', priceDelta: 7, active: true },
    { id: 4, name: 'Caramel Syrup', nameAr: 'شراب الكراميل', priceDelta: 8, active: true },
  ],
  menuItems: [
    { id: 1, name: 'Espresso', nameAr: 'اسبريسو', categoryId: 1, price: 25, active: true, modifierIds: [1, 2] },
    { id: 2, name: 'Latte', nameAr: 'لاتيه', categoryId: 1, price: 35, active: true, modifierIds: [1, 2, 4] },
    { id: 3, name: 'Cappuccino', nameAr: 'كابتشينو', categoryId: 1, price: 35, active: true, modifierIds: [1, 2] },
    { id: 4, name: 'Iced Coffee', nameAr: 'قهوة مثلجة', categoryId: 2, price: 40, active: true, modifierIds: [1, 4] },
    { id: 5, name: 'Mojito', nameAr: 'موهيتو', categoryId: 2, price: 45, active: true, modifierIds: [] },
    { id: 6, name: 'Cheesecake', nameAr: 'تشيز كيك', categoryId: 3, price: 50, active: true, modifierIds: [3] },
    { id: 7, name: 'Brownie', nameAr: 'براوني', categoryId: 3, price: 45, active: true, modifierIds: [3] },
  ],
  shifts: [],
  orders: [],
  expenses: [],
  tables: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, number: i + 1, status: 'available', orderId: null })),
  reservations: [],
  settings: {
    taxRate: 14,
    serviceChargeRate: 12,
    currency: 'EGP',
    receiptFooter: 'Thank you for visiting!',
    receiptFooterAr: 'شكراً لزيارتكم!',
    cafeName: 'Velva Café',
    logoUrl: 'https://i.imgur.com/r5502jJ.png',
  },
});
