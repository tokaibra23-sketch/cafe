
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Category, MenuItem, Modifier, User, Shift, Order, Expense, CafeSettings, CafeTable, Reservation } from '../types';
import { seedData, DB_KEY } from '../services/mockApi';

interface DataContextType {
    // State
    categories: Category[];
    menuItems: MenuItem[];
    modifiers: Modifier[];
    users: User[];
    shifts: Shift[];
    orders: Order[];
    expenses: Expense[];
    settings: CafeSettings;
    tables: CafeTable[];
    reservations: Reservation[];
    loading: boolean;
    // Actions
    addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
    updateMenuItem: (item: MenuItem) => Promise<void>;
    deleteMenuItem: (id: number) => Promise<void>;
    addModifier: (modifier: Omit<Modifier, 'id'>) => Promise<Modifier>;
    updateModifier: (modifier: Modifier) => Promise<void>;
    deleteModifier: (id: number) => Promise<void>;
    addUser: (user: Omit<User, 'id'>) => Promise<User>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    addShift: (shift: Omit<Shift, 'id'>) => Promise<Shift>;
    updateShift: (shift: Shift) => Promise<void>;
    addOrder: (order: Omit<Order, 'id'>) => Promise<Order>;
    updateOrder: (order: Order) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
    updateSettings: (settings: CafeSettings) => Promise<void>;
    updateTable: (table: CafeTable) => Promise<void>;
    addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<Reservation>;
    updateReservation: (reservation: Reservation) => Promise<void>;
    deleteReservation: (id: number) => Promise<void>;
    refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getInitialState = () => {
    try {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    }
    const initialData = seedData();
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState(getInitialState);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(() => {
        setDb(getInitialState());
    }, []);

    useEffect(() => {
        refreshData();
        setLoading(false);
    }, [refreshData]);

    const saveData = (data: any) => {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        setDb(data);
    };

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const newCategory: Category = { ...category, id: Date.now() };
        const updatedDb = { ...db, categories: [...db.categories, newCategory] };
        saveData(updatedDb);
        return newCategory;
    };
    // ... Implement all other data mutation functions
    const updateCategory = async (category: Category) => {
        const updatedDb = { ...db, categories: db.categories.map((c: Category) => c.id === category.id ? category : c) };
        saveData(updatedDb);
    };
    const deleteCategory = async (id: number) => {
        const updatedDb = { ...db, categories: db.categories.filter((c: Category) => c.id !== id), menuItems: db.menuItems.filter((i: MenuItem) => i.categoryId !== id) };
        saveData(updatedDb);
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = { ...item, id: Date.now() };
        const updatedDb = { ...db, menuItems: [...db.menuItems, newItem] };
        saveData(updatedDb);
        return newItem;
    };
    const updateMenuItem = async (item: MenuItem) => {
        const updatedDb = { ...db, menuItems: db.menuItems.map((i: MenuItem) => i.id === item.id ? item : i) };
        saveData(updatedDb);
    };
    const deleteMenuItem = async (id: number) => {
        const updatedDb = { ...db, menuItems: db.menuItems.filter((i: MenuItem) => i.id !== id) };
        saveData(updatedDb);
    };
    
    const addModifier = async (modifier: Omit<Modifier, 'id'>) => {
        const newModifier: Modifier = { ...modifier, id: Date.now() };
        const updatedDb = { ...db, modifiers: [...db.modifiers, newModifier] };
        saveData(updatedDb);
        return newModifier;
    };
    const updateModifier = async (modifier: Modifier) => {
        const updatedDb = { ...db, modifiers: db.modifiers.map((m: Modifier) => m.id === modifier.id ? modifier : m) };
        saveData(updatedDb);
    };
    const deleteModifier = async (id: number) => {
        const updatedDb = { ...db, modifiers: db.modifiers.filter((m: Modifier) => m.id !== id) };
        saveData(updatedDb);
    };

    const addUser = async (user: Omit<User, 'id'>) => {
        const newUser: User = { ...user, id: Date.now() };
        const updatedDb = { ...db, users: [...db.users, newUser] };
        saveData(updatedDb);
        return newUser;
    };
    const updateUser = async (user: User) => {
        const updatedDb = { ...db, users: db.users.map((u: User) => u.id === user.id ? user : u) };
        saveData(updatedDb);
    };
    const deleteUser = async (id: number) => {
        const updatedDb = { ...db, users: db.users.filter((u: User) => u.id !== id) };
        saveData(updatedDb);
    };
    
    const addShift = async (shift: Omit<Shift, 'id'>) => {
        const newShift: Shift = { ...shift, id: Date.now() };
        const updatedDb = { ...db, shifts: [...db.shifts, newShift] };
        saveData(updatedDb);
        return newShift;
    };
    const updateShift = async (shift: Shift) => {
        const updatedDb = { ...db, shifts: db.shifts.map((s: Shift) => s.id === shift.id ? shift : s) };
        saveData(updatedDb);
    };
    
    const addOrder = async (order: Omit<Order, 'id'>) => {
        const newOrder: Order = { ...order, id: Date.now() };
        const updatedDb = { ...db, orders: [...db.orders, newOrder] };
        saveData(updatedDb);
        return newOrder;
    };
    const updateOrder = async (order: Order) => {
        const updatedDb = { ...db, orders: db.orders.map((o: Order) => o.id === order.id ? order : o) };
        saveData(updatedDb);
    };

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expense, id: Date.now() };
        const updatedDb = { ...db, expenses: [...db.expenses, newExpense] };
        saveData(updatedDb);
        return newExpense;
    };

    const updateSettings = async (settings: CafeSettings) => {
        const updatedDb = { ...db, settings: settings };
        saveData(updatedDb);
    };

    const updateTable = async (table: CafeTable) => {
        const updatedDb = { ...db, tables: db.tables.map((t: CafeTable) => t.id === table.id ? table : t) };
        saveData(updatedDb);
    };
    
    const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
        const newReservation: Reservation = { ...reservation, id: Date.now() };
        const updatedDb = { ...db, reservations: [...(db.reservations || []), newReservation] };
        saveData(updatedDb);
        return newReservation;
    };

    const updateReservation = async (reservation: Reservation) => {
        const updatedDb = { ...db, reservations: db.reservations.map((r: Reservation) => r.id === reservation.id ? reservation : r) };
        saveData(updatedDb);
    };

    const deleteReservation = async (id: number) => {
        const updatedDb = { ...db, reservations: db.reservations.filter((r: Reservation) => r.id !== id) };
        saveData(updatedDb);
    };

    return (
        <DataContext.Provider value={{
            ...db, loading,
            addCategory, updateCategory, deleteCategory,
            addMenuItem, updateMenuItem, deleteMenuItem,
            addModifier, updateModifier, deleteModifier,
            addUser, updateUser, deleteUser,
            addShift, updateShift,
            addOrder, updateOrder,
            addExpense, updateSettings, updateTable,
            addReservation, updateReservation, deleteReservation,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
