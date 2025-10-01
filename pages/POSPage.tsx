
import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { OrderType, Category, MenuItem as MenuItemType, OrderItem, OrderItemModifier, Modifier, KitchenStatus, OrderStatus, Order as OrderTypeInterface, CafeTable, Reservation, ReservationStatus } from '../types';
import { useToasts } from '../hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

// ### Helper Components defined outside POSPage to prevent re-renders ###

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}
const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
    const { t, language } = useI18n();
    return (
        <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto p-2 bg-brand-accent rounded-t-lg">
            <button
                onClick={() => onSelectCategory(null)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${!selectedCategoryId ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary hover:bg-brand-secondary/50'}`}
            >
                {t('all')}
            </button>
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${selectedCategoryId === cat.id ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary hover:bg-brand-secondary/50'}`}
                >
                    {language === 'ar' ? cat.nameAr : cat.name}
                </button>
            ))}
        </div>
    );
};

interface MenuItemGridProps {
    items: MenuItemType[];
    onSelectItem: (item: MenuItemType) => void;
}
const MenuItemGrid: React.FC<MenuItemGridProps> = ({ items, onSelectItem }) => {
    const { t, language } = useI18n();
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 overflow-y-auto h-full">
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="bg-white rounded-lg shadow p-2 text-center aspect-square flex flex-col justify-center items-center hover:shadow-lg hover:scale-105 transition-transform"
                >
                    <div className="font-bold text-brand-primary">{language === 'ar' ? item.nameAr : item.name}</div>
                    <div className="text-sm text-brand-secondary">{item.price.toFixed(2)} {t('currency')}</div>
                </button>
            ))}
        </div>
    );
};

interface OrderCartProps {
    cart: OrderItem[];
    settings: any;
    discount: number;
    setDiscount: (d: number) => void;
    onRemoveItem: (itemId: string) => void;
    onUpdateQuantity: (itemId: string, newQuantity: number) => void;
    isEditingOrder: boolean;
    selectedTable: CafeTable | null;
}
const OrderCart: React.FC<OrderCartProps> = ({ cart, settings, discount, setDiscount, onRemoveItem, onUpdateQuantity, isEditingOrder, selectedTable }) => {
    const { t, language, dir } = useI18n();
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.lineTotal, 0), [cart]);
    const serviceCharge = (subtotal - discount) * (settings.serviceChargeRate / 100);
    const tax = (subtotal - discount + serviceCharge) * (settings.taxRate / 100);
    const grandTotal = subtotal - discount + serviceCharge + tax;

    return (
        <div className="bg-white h-full flex flex-col p-4 shadow-inner">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
                {isEditingOrder && selectedTable
                    ? `${t('order')} - ${t('table')} ${selectedTable.number}`
                    : t('cart')}
            </h2>
            <div className="flex-grow overflow-y-auto">
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center mt-8">{t('cart')} is empty.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="mb-4 p-2 border rounded-md">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold">{language === 'ar' ? item.nameAr : item.name}</span>
                                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            {item.modifiers.length > 0 && (
                                <div className="text-xs text-gray-500 ps-2">
                                    {item.modifiers.map(mod => `+ ${language === 'ar' ? mod.nameAr : mod.name}`).join(', ')}
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 border rounded-l">-</button>
                                    <span className="px-3 border-t border-b">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 border rounded-r">+</button>
                                </div>
                                <span>{(item.lineTotal).toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="border-t pt-4 mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                    <span>{t('discount')}:</span>
                    <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className={`w-20 border rounded px-1 py-0.5 text-center mx-2 ${dir === 'rtl' ? 'ms-auto' : 'ml-auto'}`} />
                    <span>{t('currency')}</span>
                </div>
                <div className="flex justify-between"><span>{t('subtotal')}:</span> <span>{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{t('serviceCharge')}:</span> <span>{serviceCharge.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{t('tax')}:</span> <span>{tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg text-brand-primary">
                    <span>{t('grandTotal')}:</span>
                    <span>{grandTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

// ### Main POSPage Component ###
const POSPage: React.FC = () => {
    const { t, language, dir } = useI18n();
    const { categories, menuItems, modifiers, settings, tables, reservations, addOrder, updateTable, updateOrder, refreshData } = useData();
    const { user, activeShift, logout } = useAuth();
    const { showToast } = useToasts();
    const navigate = useNavigate();

    const [orderType, setOrderType] = useState<OrderType>(OrderType.Takeaway);
    const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [isModifierModalOpen, setModifierModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isTableModalOpen, setTableModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItemType | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<Set<number>>(new Set());
    
    // State for existing table orders
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const { orders } = useData();

    useEffect(() => {
        // Poll for table status changes
        const interval = setInterval(() => {
            refreshData();
        }, 5000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const filteredMenuItems = useMemo(() => {
        if (!selectedCategoryId) return menuItems.filter(item => item.active);
        return menuItems.filter(item => item.categoryId === selectedCategoryId && item.active);
    }, [selectedCategoryId, menuItems]);

    const handleSelectItem = (item: MenuItemType) => {
        setCurrentItem(item);
        if (item.modifierIds.length > 0) {
            setSelectedModifiers(new Set());
            setModifierModalOpen(true);
        } else {
            addToCart(item, []);
        }
    };

    const handleAddWithModifiers = () => {
        if (!currentItem) return;
        const mods: OrderItemModifier[] = Array.from(selectedModifiers).map(modId => {
            const mod = modifiers.find(m => m.id === modId)!;
            return { modifierId: mod.id, name: mod.name, nameAr: mod.nameAr, priceDelta: mod.priceDelta };
        });
        addToCart(currentItem, mods);
        setModifierModalOpen(false);
        setCurrentItem(null);
    };
    
    const addToCart = (item: MenuItemType, mods: OrderItemModifier[]) => {
        const existingItem = cart.find(cartItem => 
            cartItem.menuItemId === item.id && 
            cartItem.modifiers.length === mods.length &&
            cartItem.modifiers.every(m => mods.some(mod => mod.modifierId === m.modifierId))
        );

        if (existingItem) {
            updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
        } else {
            const unitPrice = item.price + mods.reduce((sum, mod) => sum + mod.priceDelta, 0);
            const newItem: OrderItem = {
                id: Date.now().toString(),
                menuItemId: item.id,
                name: item.name,
                nameAr: item.nameAr,
                quantity: 1,
                unitPrice,
                modifiers: mods,
                lineTotal: unitPrice,
            };
            setCart(prev => [...prev, newItem]);
        }
    };

    const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            setCart(prev => prev.filter(item => item.id !== itemId));
        } else {
            setCart(prev => prev.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity, lineTotal: item.unitPrice * newQuantity }
                    : item
            ));
        }
    };

    const handleRemoveFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const resetOrder = () => {
        setCart([]);
        setDiscount(0);
        setSelectedTable(null);
        setOrderType(OrderType.Takeaway);
        setIsEditingOrder(false);
        setEditingOrderId(null);
    };

    const handlePlaceOrder = async (payments: any[]) => {
        if (!activeShift) {
            showToast('No active shift found!', 'error');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
        const serviceCharge = (subtotal - discount) * (settings.serviceChargeRate / 100);
        const tax = (subtotal - discount + serviceCharge) * (settings.taxRate / 100);
        const total = subtotal - discount + serviceCharge + tax;

        if (isEditingOrder && editingOrderId !== null) {
            const existingOrder = orders.find(o => o.id === editingOrderId);
            if (!existingOrder) return;
            const updatedOrder: OrderTypeInterface = {
                ...existingOrder,
                items: cart,
                subtotal,
                serviceCharge,
                tax,
                discount,
                total,
                payments,
                status: OrderStatus.Paid,
                closedAt: new Date().toISOString(),
            };
            await updateOrder(updatedOrder);
            if(selectedTable) {
                await updateTable({ ...selectedTable, status: 'available', orderId: null });
            }

        } else {
            const newOrder: Omit<OrderTypeInterface, 'id'> = {
                type: orderType,
                tableNo: selectedTable?.number ?? null,
                status: OrderStatus.Paid,
                kitchenStatus: KitchenStatus.New,
                openedAt: new Date().toISOString(),
                closedAt: new Date().toISOString(),
                shiftId: activeShift.id,
                items: cart,
                subtotal,
                serviceCharge,
                tax,
                discount,
                total,
                payments,
            };
            const createdOrder = await addOrder(newOrder);
            if (orderType === OrderType.Table && selectedTable) {
                await updateTable({ ...selectedTable, status: 'available', orderId: null });
            }
        }
        
        showToast(t('orderPlaced'), 'success');
        setPaymentModalOpen(false);
        resetOrder();
    };

    const handleSaveOrder = async () => {
         if (!activeShift || !selectedTable) {
            showToast('Please select a table for the order.', 'error');
            return;
        }
        const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
        const serviceCharge = (subtotal - discount) * (settings.serviceChargeRate / 100);
        const tax = (subtotal - discount + serviceCharge) * (settings.taxRate / 100);
        const total = subtotal - discount + serviceCharge + tax;

        if (isEditingOrder && editingOrderId !== null) {
            const existingOrder = orders.find(o => o.id === editingOrderId);
            if (!existingOrder) return;

             const updatedOrder: OrderTypeInterface = {
                ...existingOrder,
                items: cart, subtotal, serviceCharge, tax, discount, total,
            };
            await updateOrder(updatedOrder);
        } else {
             const newOrder: Omit<OrderTypeInterface, 'id'> = {
                type: orderType,
                tableNo: selectedTable?.number ?? null,
                status: OrderStatus.Open,
                kitchenStatus: KitchenStatus.New,
                openedAt: new Date().toISOString(),
                closedAt: null,
                shiftId: activeShift.id,
                items: cart,
                subtotal, serviceCharge, tax, discount, total,
                payments: [],
            };
            const createdOrder = await addOrder(newOrder);
            await updateTable({ ...selectedTable, status: 'occupied', orderId: createdOrder.id });
        }
        showToast('Order saved to table.', 'success');
        resetOrder();
    }
    
    const handleSelectTable = (table: CafeTable) => {
        setSelectedTable(table);
        setOrderType(OrderType.Table);
        setTableModalOpen(false);
        if (table.status === 'occupied' && table.orderId) {
            const openOrder = orders.find(o => o.id === table.orderId);
            if (openOrder) {
                setCart(openOrder.items);
                setDiscount(openOrder.discount);
                setIsEditingOrder(true);
                setEditingOrderId(openOrder.id);
            }
        } else {
            setIsEditingOrder(false);
            setEditingOrderId(null);
            setCart([]);
            setDiscount(0);
        }
    }


    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.lineTotal, 0), [cart]);
    const serviceCharge = (subtotal - discount) * (settings.serviceChargeRate / 100);
    const tax = (subtotal - discount + serviceCharge) * (settings.taxRate / 100);
    const grandTotal = subtotal - discount + serviceCharge + tax;

    const getUpcomingReservationForTable = (tableId: number): Reservation | undefined => {
        if (!reservations) return undefined;
        const now = new Date();
        const todayReservations = reservations.filter(r => {
            const resTime = new Date(r.reservationTime);
            return r.tableId === tableId &&
                   r.status === ReservationStatus.Upcoming &&
                   resTime.getFullYear() === now.getFullYear() &&
                   resTime.getMonth() === now.getMonth() &&
                   resTime.getDate() === now.getDate() &&
                   resTime > now; // Only future reservations today
        });
        // Return the soonest one
        return todayReservations.sort((a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime())[0];
    }
    
    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        } else {
            if (result.reason === 'activeShiftError') {
                showToast(t('closeShiftBeforeLogout'), 'error');
                navigate('/shift');
            } else {
                showToast('Logout failed.', 'error');
            }
        }
    };


    return (
        <div className="h-screen w-screen flex flex-col bg-brand-light" dir={dir}>
            {/* Header */}
            <header className="bg-white shadow-md p-2 flex justify-between items-center text-brand-primary">
                <div className="flex items-center">
                    <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 mr-3 rtl:ml-3"/>
                    <h1 className="text-xl font-bold">{settings.cafeName}</h1>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-100 text-brand-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex overflow-hidden">
                {/* Menu Section */}
                <div className="w-3/5 xl:w-2/3 flex flex-col">
                    <CategoryTabs categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
                    <div className="flex-grow bg-brand-accent/50 overflow-hidden">
                        <MenuItemGrid items={filteredMenuItems} onSelectItem={handleSelectItem} />
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-2/5 xl:w-1/3 flex flex-col border-l rtl:border-r rtl:border-l-0 border-brand-accent">
                    <div className="p-4 bg-white border-b">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <button onClick={() => {resetOrder(); setOrderType(OrderType.Takeaway)}} className={`w-1/2 py-2 rounded ${orderType === OrderType.Takeaway ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>{t('takeaway')}</button>
                            <button onClick={() => setTableModalOpen(true)} className={`w-1/2 py-2 rounded flex items-center justify-center ${orderType === OrderType.Table ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>
                                {t('table')} {selectedTable && `(${selectedTable.number})`}
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <OrderCart cart={cart} settings={settings} discount={discount} setDiscount={setDiscount} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={updateCartItemQuantity} isEditingOrder={isEditingOrder} selectedTable={selectedTable} />
                    </div>
                    <div className="p-4 bg-white border-t space-y-2">
                        {cart.length > 0 && orderType === OrderType.Table && (
                            <button onClick={handleSaveOrder} className="w-full py-3 bg-brand-warning text-white font-bold rounded-lg text-lg">
                                {isEditingOrder ? "Update Table Order" : "Save to Table"}
                            </button>
                        )}
                        <button onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full py-3 bg-brand-success text-white font-bold rounded-lg text-lg disabled:bg-gray-400">
                            {t('payment')} ({grandTotal.toFixed(2)})
                        </button>
                         <button onClick={resetOrder} className="w-full py-2 bg-brand-danger text-white font-bold rounded-lg text-sm">
                            {t('newOrder')}
                        </button>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <Modal isOpen={isModifierModalOpen} onClose={() => setModifierModalOpen(false)} title={`${t('selectModifiers')} ${language === 'ar' ? currentItem?.nameAr : currentItem?.name}`}>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentItem?.modifierIds.map(modId => {
                        const modifier = modifiers.find(m => m.id === modId);
                        if (!modifier || !modifier.active) return null;
                        const isSelected = selectedModifiers.has(modId);
                        return (
                            <div key={modId} onClick={() => setSelectedModifiers(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(modId)) newSet.delete(modId);
                                else newSet.add(modId);
                                return newSet;
                            })} className={`flex justify-between p-3 rounded cursor-pointer ${isSelected ? 'bg-brand-secondary text-white' : 'bg-gray-100'}`}>
                                <span>{language === 'ar' ? modifier.nameAr : modifier.name}</span>
                                <span>+{modifier.priceDelta.toFixed(2)}</span>
                            </div>
                        );
                    })}
                </div>
                <button onClick={handleAddWithModifiers} className="w-full mt-4 py-2 bg-brand-primary text-white font-bold rounded">{t('addToCart')}</button>
            </Modal>
            
            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                totalAmount={grandTotal}
                onConfirmPayment={handlePlaceOrder}
            />

            {/* Table Selection Modal */}
            <Modal isOpen={isTableModalOpen} onClose={() => setTableModalOpen(false)} title={t('selectTable')} size="xl">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {tables.map(table => {
                        const upcomingReservation = getUpcomingReservationForTable(table.id);
                        return (
                            <button
                                key={table.id}
                                onClick={() => handleSelectTable(table)}
                                className={`p-4 rounded-lg text-white font-bold text-xl aspect-square flex flex-col justify-center items-center relative
                                    ${table.status === 'occupied' ? 'bg-brand-danger' : 'bg-brand-success'}
                                    ${selectedTable?.id === table.id ? 'ring-4 ring-offset-2 ring-brand-primary' : ''}
                                `}
                            >
                                <span>{table.number}</span>
                                {table.status === 'occupied' && <span className="text-xs font-normal">Occupied</span>}
                                {upcomingReservation && table.status === 'available' && (
                                    <div className="absolute bottom-1 text-xs font-normal flex items-center justify-center bg-black/30 rounded-full px-2 py-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span>{new Date(upcomingReservation.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};


interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirmPayment: (payments: any[]) => void;
}
const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, totalAmount, onConfirmPayment }) => {
    const { t } = useI18n();
    const [paymentMethod, setPaymentMethod] = useState<any>('cash');
    const [amountPaid, setAmountPaid] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmountPaid(totalAmount.toFixed(2));
        }
    }, [isOpen, totalAmount]);

    const change = parseFloat(amountPaid) - totalAmount;

    const handleConfirm = () => {
        const payment = {
            method: paymentMethod,
            amount: totalAmount,
            paidAt: new Date().toISOString()
        };
        onConfirmPayment([payment]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('payment')}>
            <div className="space-y-4">
                <div className="text-center p-4 bg-brand-accent rounded-lg">
                    <div className="text-lg text-brand-secondary">{t('grandTotal')}</div>
                    <div className="text-4xl font-bold text-brand-primary">{totalAmount.toFixed(2)} {t('currency')}</div>
                </div>
                <div className="flex justify-around">
                    {['cash', 'card', 'mobile'].map(method => (
                        <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`px-6 py-2 rounded-lg font-semibold ${paymentMethod === method ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
                        >
                            {t(method)}
                        </button>
                    ))}
                </div>
                {paymentMethod === 'cash' && (
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm font-medium">{t('amountPaid')}</label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                className="w-full p-2 border rounded mt-1 text-center text-lg"
                            />
                        </div>
                        {change >= 0 && (
                            <div className="text-center p-2 bg-green-100 rounded">
                                <span className="text-lg font-medium">{t('change')}: {change.toFixed(2)} {t('currency')}</span>
                            </div>
                        )}
                    </div>
                )}
                <button onClick={handleConfirm} className="w-full py-3 bg-brand-success text-white font-bold rounded-lg text-lg">
                    {t('confirm')}
                </button>
            </div>
        </Modal>
    );
};

export default POSPage;
