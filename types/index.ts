
export enum Language {
    EN = 'en',
    AR = 'ar',
}

export enum Role {
    Admin = 'admin',
    Cashier = 'cashier',
    Kitchen = 'kitchen',
}

export interface User {
    id: number;
    name: string;
    username: string;
    passwordHash: string;
    role: Role;
    active: boolean;
}

export interface Shift {
    id: number;
    userId: number;
    openedAt: string;
    closedAt: string | null;
    openingCash: number;
    closingCash: number | null;
    calculatedCash: number;
}

export interface Category {
    id: number;
    name: string;
    nameAr: string;
}

export interface Modifier {
    id: number;
    name: string;
    nameAr: string;
    priceDelta: number;
    active: boolean;
}

export interface MenuItem {
    id: number;
    name: string;
    nameAr: string;
    categoryId: number;
    price: number;
    active: boolean;
    modifierIds: number[];
}

export enum OrderType {
    Takeaway = 'takeaway',
    Table = 'table',
}

export enum OrderStatus {
    Open = 'open',
    Paid = 'paid',
    Cancelled = 'cancelled',
}

export enum KitchenStatus {
    New = 'new',
    Preparing = 'preparing',
    Ready = 'ready',
}

export interface OrderItemModifier {
    modifierId: number;
    name: string;
    nameAr: string;
    priceDelta: number;
}

export interface OrderItem {
    id: string; // Temp ID for cart
    menuItemId: number;
    name: string;
    nameAr: string;
    quantity: number;
    unitPrice: number;
    modifiers: OrderItemModifier[];
    lineTotal: number;
}

export interface Order {
    id: number;
    type: OrderType;
    tableNo: number | null;
    status: OrderStatus;
    kitchenStatus: KitchenStatus;
    openedAt: string;
    closedAt: string | null;
    shiftId: number;
    items: OrderItem[];
    subtotal: number;
    serviceCharge: number;
    tax: number;
    discount: number;
    total: number;
    payments: Payment[];
}

export enum PaymentMethod {
    Cash = 'cash',
    Card = 'card',
    Mobile = 'mobile',
}

export interface Payment {
    method: PaymentMethod;
    amount: number;
    paidAt: string;
}

export interface Expense {
    id: number;
    category: string;
    amount: number;
    note: string;
    createdAt: string;
    shiftId: number;
}

export interface CafeSettings {
    taxRate: number; // as percentage
    serviceChargeRate: number; // as percentage
    currency: string;
    receiptFooter: string;
    receiptFooterAr: string;
    cafeName: string;
    logoUrl: string;
}

export interface CafeTable {
    id: number;
    number: number;
    status: 'available' | 'occupied';
    orderId: number | null;
}

export enum ReservationStatus {
    Upcoming = 'upcoming',
    Seated = 'seated',
    Completed = 'completed',
    Cancelled = 'cancelled',
}

export interface Reservation {
    id: number;
    tableId: number;
    customerName: string;
    customerPhone: string;
    reservationTime: string; // ISO string
    partySize: number;
    status: ReservationStatus;
    notes?: string;
}
