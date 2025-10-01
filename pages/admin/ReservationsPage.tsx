
import React, { useState, useMemo } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useData } from '../../contexts/DataContext';
import { Reservation, ReservationStatus } from '../../types';
import { useToasts } from '../../hooks/useToasts';
import Modal from '../../components/Modal';

const ReservationsPage: React.FC = () => {
    const { t } = useI18n();
    const { reservations, tables, addReservation, updateReservation } = useData();
    const { showToast } = useToasts();
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    const filteredReservations = useMemo(() => {
        return (reservations || [])
            .filter(r => r.reservationTime.startsWith(selectedDate))
            .sort((a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime());
    }, [reservations, selectedDate]);

    const handleAddNew = () => {
        setEditingReservation(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (reservation: Reservation, status: ReservationStatus) => {
        await updateReservation({ ...reservation, status });
        showToast(t('reservationUpdated'), 'success');
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Upcoming: return 'bg-blue-100 text-blue-800';
            case ReservationStatus.Seated: return 'bg-green-100 text-green-800';
            case ReservationStatus.Cancelled: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">{t('reservations')}</h1>
                <div className="flex items-center space-x-4">
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded-lg"
                    />
                    <button onClick={handleAddNew} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">{t('addReservation')}</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('upcomingReservations')} for {new Date(selectedDate).toDateString()}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">{t('time')}</th>
                                <th className="p-2">{t('customerName')}</th>
                                <th className="p-2">{t('tableNo')}</th>
                                <th className="p-2">{t('partySize')}</th>
                                <th className="p-2">{t('status')}</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservations.length > 0 ? filteredReservations.map(res => (
                                <tr key={res.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 font-semibold">{new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-2">{res.customerName} ({res.customerPhone})</td>
                                    <td className="p-2">{tables.find(t => t.id === res.tableId)?.number}</td>
                                    <td className="p-2">{res.partySize}</td>
                                    <td className="p-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(res.status)}`}>{t(res.status)}</span></td>
                                    <td className="p-2 space-x-2">
                                        {res.status === ReservationStatus.Upcoming && (
                                             <button onClick={() => handleStatusChange(res, ReservationStatus.Seated)} className="text-green-600 hover:underline text-sm">{t('seatCustomer')}</button>
                                        )}
                                        <button onClick={() => handleEdit(res)} className="text-blue-600 hover:underline text-sm">{t('edit')}</button>
                                        {res.status !== ReservationStatus.Cancelled && (
                                            <button onClick={() => handleStatusChange(res, ReservationStatus.Cancelled)} className="text-red-600 hover:underline text-sm">{t('cancelReservation')}</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center p-4 text-gray-500">{t('noReservations')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ReservationModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    reservation={editingReservation}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
};

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    selectedDate: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, reservation, selectedDate }) => {
    const { t } = useI18n();
    const { tables, reservations, addReservation, updateReservation } = useData();
    const { showToast } = useToasts();

    const [formData, setFormData] = useState({
        customerName: reservation?.customerName || '',
        customerPhone: reservation?.customerPhone || '',
        partySize: reservation?.partySize || 2,
        time: reservation ? new Date(reservation.reservationTime).toTimeString().substring(0,5) : '18:00',
        tableId: reservation?.tableId || null as number | null,
        notes: reservation?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: name === 'partySize' ? parseInt(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tableId) {
            showToast('Please select a table.', 'error');
            return;
        }

        const reservationTime = new Date(`${selectedDate}T${formData.time}`).toISOString();

        if (reservation) {
            // Editing
            await updateReservation({
                ...reservation,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                partySize: formData.partySize,
                reservationTime,
                tableId: formData.tableId,
                notes: formData.notes,
            });
            showToast(t('reservationUpdated'), 'success');
        } else {
            // Creating
            await addReservation({
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                partySize: formData.partySize,
                reservationTime,
                tableId: formData.tableId,
                status: ReservationStatus.Upcoming,
                notes: formData.notes,
            });
            showToast(t('reservationAdded'), 'success');
        }
        onClose();
    };

    const isTableBooked = (tableId: number) => {
        const selectedDateTime = new Date(`${selectedDate}T${formData.time}`).getTime();
        // A 2-hour window means 1 hour before and 1 hour after. So total 2 * 60 * 60 * 1000.
        // Let's make it slightly less than 2 hours to avoid edge cases with back-to-back bookings.
        // e.g., a 6pm booking shouldn't conflict with an 8pm booking.
        // A conflict window of 1 hour 59 minutes seems safe.
        const conflictWindow = (2 * 60 * 60 * 1000) - 60000; // 1h 59min in ms

        return (reservations || []).some(r => {
            if (r.tableId !== tableId || r.status === ReservationStatus.Cancelled) return false;
            // Don't conflict with itself when editing
            if (reservation && r.id === reservation.id) return false; 
            
            const existingResTime = new Date(r.reservationTime).getTime();
            // Check for overlap within the conflict window
            return Math.abs(selectedDateTime - existingResTime) < conflictWindow;
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reservation ? t('editReservation') : t('newReservation')} size="xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('customerName')}</label>
                        <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="w-full p-2 border rounded mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('customerPhone')}</label>
                        <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required className="w-full p-2 border rounded mt-1"/>
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">{t('partySize')}</label>
                            <input type="number" name="partySize" value={formData.partySize} onChange={handleChange} min="1" required className="w-full p-2 border rounded mt-1"/>
                        </div>
                        <div className="w-1/2">
                             <label className="block text-sm font-medium">{t('time')}</label>
                             <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-2 border rounded mt-1"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('note')}</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full p-2 border rounded mt-1"/>
                    </div>
                </div>
                {/* Right side: Table Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">{t('selectTable')}</h3>
                    <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded">
                        {tables.map(table => {
                            const isBooked = isTableBooked(table.id);
                            const isSelected = formData.tableId === table.id;
                            return (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => !isBooked && setFormData(p => ({ ...p, tableId: table.id }))}
                                    disabled={isBooked}
                                    className={`p-2 rounded font-bold aspect-square
                                        ${isBooked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}
                                        ${isSelected ? 'ring-4 ring-offset-1 ring-blue-500' : ''}
                                    `}
                                >
                                    {table.number}
                                </button>
                            );
                        })}
                    </div>
                    {isTableBooked(formData.tableId!) && <p className="text-red-500 text-sm mt-2">{t('tableReserved')}</p>}
                </div>
                
                <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg">{t('save')}</button>
                </div>
            </form>
        </Modal>
    )
}


export default ReservationsPage;
