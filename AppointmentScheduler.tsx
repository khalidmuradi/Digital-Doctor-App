
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Appointment, Patient, AppSettings } from '../types';

const initialFormData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'status'> = {
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    duration: 15,
    type: 'consultation',
    reason: '',
    reminder: 'none',
};

const AppointmentForm: React.FC<{
    patients: Patient[];
    onSave: (formData: any) => void;
    onCancel: () => void;
    initialData: any;
    isEditing: boolean;
}> = ({ patients, onSave, onCancel, initialData, isEditing }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{isEditing ? t('editAppointment') : t('newAppointment')}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('patient')}</label>
                <select value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">{t('selectPatient')}</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
                    <input type="date" value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('time')}</label>
                    <input type="time" value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('duration')}</label>
                    <select value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value={15}>15 {t('minutes')}</option>
                        <option value={30}>30 {t('minutes')}</option>
                        <option value={45}>45 {t('minutes')}</option>
                        <option value={60}>60 {t('minutes')}</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('type')}</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as Appointment['type']})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="consultation">{t('consultation')}</option>
                        <option value="follow-up">{t('followUp')}</option>
                        <option value="check-up">{t('checkUp')}</option>
                        <option value="emergency">{t('emergency')}</option>
                        <option value="surgery">{t('surgery')}</option>
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">{t('reminder')}</label>
                <select value={formData.reminder || 'none'} onChange={e => setFormData({...formData, reminder: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="none">{t('noReminder')}</option>
                    <option value="15min">{t('reminder15min')}</option>
                    <option value="1hr">{t('reminder1hr')}</option>
                    <option value="24hr">{t('reminder24hr')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('reasonForVisit')}</label>
                <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder={t('briefReason')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{isEditing ? t('updateAppointment') : t('createAppointment')}</button>
            </div>
        </form>
    );
};

interface AppointmentSchedulerProps {
    appointments: Appointment[];
    onAppointmentsUpdate: (appointments: Appointment[]) => void;
    patients: Patient[];
    settings: AppSettings | null;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ appointments, onAppointmentsUpdate, patients, settings }) => {
    const { t, language } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || t('unknownPatient');

    const handleSave = (formData: any) => {
        const appointmentData = { ...formData, duration: Number(formData.duration) };
        const newAppointment: Appointment = {
            id: editingAppointment?.id || Date.now().toString(),
            status: editingAppointment?.status || 'scheduled',
            ...appointmentData,
            created_at: editingAppointment?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const updatedAppointments = editingAppointment
            ? appointments.map(appt => appt.id === editingAppointment.id ? newAppointment : appt)
            : [...appointments, newAppointment];
        
        onAppointmentsUpdate(updatedAppointments);
        setShowForm(false);
        setEditingAppointment(null);
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setShowForm(true);
    };
    
    const handleDelete = (appointmentId: string) => {
        if (window.confirm(t('deleteAppointmentConfirmation'))) {
            onAppointmentsUpdate(appointments.filter(appt => appt.id !== appointmentId));
        }
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, date: null });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateString = date.toISOString().split('T')[0];
            days.push({
                day: i,
                date: date,
                appointments: appointments.filter(a => a.appointment_date === dateString)
            });
        }
        return days;
    }, [currentDate, appointments]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const selectedDateAppointments = appointments
        .filter(a => a.appointment_date === selectedDate.toISOString().split('T')[0])
        .sort((a,b) => a.appointment_time.localeCompare(b.appointment_time));
        
    const appointmentColors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800'];
    
    const newAppointmentData = {
        ...initialFormData,
        appointment_date: selectedDate.toISOString().split('T')[0],
        reminder: settings?.defaultAppointmentReminder || '1hr',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&lt; {t('previous')}</button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {t(`month_${currentDate.getMonth()}`)} {currentDate.getFullYear()}
                    </h2>
                     <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">{t('next')} &gt;</button>
                </div>
                 <button onClick={() => setCurrentDate(new Date())} className="mb-4 text-sm text-blue-600 hover:underline">{t('today')}</button>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 text-sm">
                    {Array.from({length: 7}).map((_, i) => <div key={i} className="py-2">{t(`day_${i}`)}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                        <div 
                            key={index} 
                            className={`h-32 border rounded-md p-1.5 flex flex-col cursor-pointer transition-colors ${!day.day ? 'bg-gray-50' : 'hover:bg-blue-50'} 
                            ${day.date?.toDateString() === new Date().toDateString() ? 'bg-blue-100 border-blue-400' : ''}
                            ${day.date?.toDateString() === selectedDate.toDateString() ? 'bg-yellow-100 border-yellow-400' : ''}`}
                            onClick={() => day.date && setSelectedDate(day.date)}
                        >
                            {day.day && <span className="font-medium text-gray-800">{day.day}</span>}
                            <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                                {day.appointments?.slice(0, 3).map((appt, i) => (
                                    <div 
                                        key={appt.id} 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(appt); }}
                                        className={`text-xs p-1 rounded-md truncate ${appointmentColors[i % appointmentColors.length]}`}
                                    >
                                        {appt.appointment_time} {getPatientName(appt.patient_id)}
                                    </div>
                                ))}
                                {day.appointments && day.appointments.length > 3 && (
                                    <div className="text-xs text-gray-500 font-semibold mt-1">
                                        + {day.appointments.length - 3} {t('more')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {showForm ? (
                        <AppointmentForm 
                            patients={patients}
                            onSave={handleSave}
                            onCancel={() => { setShowForm(false); setEditingAppointment(null); }}
                            initialData={editingAppointment || newAppointmentData}
                            isEditing={!!editingAppointment}
                        />
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">{t('dailyScheduleFor')} {selectedDate.toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { day: 'numeric', month: 'long' })}</h3>
                                <button onClick={() => { setEditingAppointment(null); setShowForm(true); }} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">+</button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                               {selectedDateAppointments.length > 0 ? selectedDateAppointments.map(appt => (
                                   <div key={appt.id} className="p-3 border rounded-lg bg-gray-50">
                                       <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{appt.appointment_time} - {getPatientName(appt.patient_id)}</p>
                                                <p className="text-sm text-gray-600">{t(appt.type)}</p>
                                                {appt.reason && <p className="text-xs text-gray-500 italic mt-1">{appt.reason}</p>}
                                                {appt.reminder && appt.reminder !== 'none' && (
                                                    <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                                        <span>&#128276;</span> {t(`reminder${appt.reminder.replace('min','').replace('hr','')}`)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {t(appt.status)}
                                                </span>
                                            </div>
                                       </div>
                                       <div className="mt-2 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                                           <button onClick={() => handleEdit(appt)} className="text-xs text-blue-600 hover:underline">{t('edit')}</button>
                                            <button onClick={() => handleDelete(appt.id)} className="text-xs text-red-600 hover:underline">{t('delete')}</button>
                                       </div>
                                   </div>
                               )) : <p className="text-center text-gray-500 py-4">{t('noAppointments')}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentScheduler;