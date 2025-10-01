
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Shift, Role } from '../types';
import { useData } from './DataContext';

// This is a simple hash function for demonstration. 
// In a real app, use a robust library like bcrypt.
const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

interface AuthContextType {
    user: User | null;
    activeShift: Shift | null;
    login: (username: string, password: string) => Promise<User | null>;
    logout: () => Promise<{ success: boolean; reason?: string }>;
    openShift: (openingCash: number) => Promise<Shift | null>;
    closeShift: (closingCash: number) => Promise<void>;
    reloadActiveShift: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const data = useData();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('velva_cafe_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === Role.Cashier || parsedUser.role === Role.Admin) {
                reloadActiveShift();
            }
        }
    }, [data.shifts]);

    const reloadActiveShift = () => {
        const storedUser = sessionStorage.getItem('velva_cafe_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const currentShift = data.shifts.find(s => s.userId === parsedUser.id && s.closedAt === null);
            setActiveShift(currentShift || null);
        }
    }

    const login = async (username: string, password: string): Promise<User | null> => {
        const targetUser = data.users.find(u => u.username === username);
        if (!targetUser) return null;

        const passwordHash = await simpleHash(password);
        if (targetUser.passwordHash !== passwordHash) return null;

        if (!targetUser.active) {
            throw new Error('accountInactive');
        }

        setUser(targetUser);
        sessionStorage.setItem('velva_cafe_user', JSON.stringify(targetUser));
        if (targetUser.role === Role.Cashier || targetUser.role === Role.Admin) {
            const currentShift = data.shifts.find(s => s.userId === targetUser.id && s.closedAt === null);
            setActiveShift(currentShift || null);
        }
        return targetUser;
    };

    const logout = async (): Promise<{ success: boolean; reason?: string }> => {
        if (activeShift) {
            return { success: false, reason: 'activeShiftError' };
        }
        setUser(null);
        setActiveShift(null);
        sessionStorage.removeItem('velva_cafe_user');
        return { success: true };
    };
    
    const openShift = async (openingCash: number): Promise<Shift | null> => {
        if (!user) return null;
        if (activeShift) return activeShift;

        const newShift = await data.addShift({
            userId: user.id,
            openedAt: new Date().toISOString(),
            closedAt: null,
            openingCash,
            closingCash: null,
            calculatedCash: 0,
        });
        setActiveShift(newShift);
        return newShift;
    };
    
    const closeShift = async (closingCash: number) => {
        if (!activeShift) return;

        const shiftOrders = data.orders.filter(o => o.shiftId === activeShift.id);
        const cashPayments = shiftOrders
            .flatMap(o => o.payments)
            .filter(p => p.method === 'cash')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const expenses = data.expenses.filter(e => e.shiftId === activeShift.id);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const calculatedCash = activeShift.openingCash + cashPayments - totalExpenses;
        
        const updatedShift = {
            ...activeShift,
            closedAt: new Date().toISOString(),
            closingCash,
            calculatedCash: calculatedCash,
        };

        await data.updateShift(updatedShift);
        setActiveShift(null);
    };


    return (
        <AuthContext.Provider value={{ user, activeShift, login, logout, openShift, closeShift, reloadActiveShift }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
