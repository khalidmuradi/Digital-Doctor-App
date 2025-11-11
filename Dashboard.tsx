import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Patient, Appointment, Prescription } from '../types';

interface DashboardProps {
    patients: Patient[];
    appointments: Appointment[];
    prescriptions: Prescription[];
    setCurrentView: (view: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 rtl:space-x-reverse cursor-pointer transition-transform transform hover:-translate-y-1 border-l-4 ${color}`}>
        <div className="text-4xl">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const QuickActionCard: React.FC<{ title: string; icon: string; onClick: () => void; color: string }> = ({ title, icon, onClick, color }) => (
    <button onClick={onClick} className={`p-4 rounded-xl shadow-md flex flex-col items-center justify-center space-y-2 transition-transform transform hover:-translate-y-1 ${color}`}>
        <span className="text-3xl">{icon}</span>
        <span className="font-semibold text-sm">{title}</span>
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, prescriptions, setCurrentView }) => {
    const { t } = useTranslation();
    const { language } = useTranslation();

    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments
        .filter(a => a.appointment_date === today)
        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
        
    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || t('unknownPatient');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}</h1>
                <p className="text-gray-600 mt-1">{t('welcomeMessage')}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('totalPatients')} value={patients.length} icon="👥" color="border-blue-500" onClick={() => setCurrentView('patients')} />
                <StatCard title={t('todaysAppointments')} value={todaysAppointments.length} icon="📅" color="border-green-500" onClick={() => setCurrentView('appointments')} />
                <StatCard title={t('totalPrescriptions')} value={prescriptions.length} icon="💊" color="border-red-500" onClick={() => setCurrentView('prescriptions')} />
                <StatCard title={t('practiceAnalytics')} value={t('viewAll')} icon="📈" color="border-purple-500" onClick={() => setCurrentView('analytics')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{t('todaysAppointments')}</h2>
                        <button onClick={() => setCurrentView('appointments')} className="text-sm text-blue-600 hover:underline font-medium">{t('viewAllAppointments')}</button>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {todaysAppointments.length > 0 ? (
                            todaysAppointments.map(appt => (
                                <div key={appt.id} className="flex items-center space-x-4 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-md">{appt.appointment_time}</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-700">{getPatientName(appt.patient_id)}</p>
                                        <p className="text-sm text-gray-500">{t(appt.type)} - {appt.reason}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {t(appt.status)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">{t('noAppointmentsToday')}</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('quickActions')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionCard title={t('addNewPatient')} icon="➕" onClick={() => setCurrentView('patients')} color="bg-blue-100 text-blue-800 hover:bg-blue-200" />
                        <QuickActionCard title={t('newAppointment')} icon="📅" onClick={() => setCurrentView('appointments')} color="bg-green-100 text-green-800 hover:bg-green-200" />
                        <QuickActionCard title={t('newPrescription')} icon="💊" onClick={() => setCurrentView('prescriptions')} color="bg-red-100 text-red-800 hover:bg-red-200" />
                        <QuickActionCard title={t('settings')} icon="⚙️" onClick={() => setCurrentView('settings')} color="bg-gray-200 text-gray-800 hover:bg-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;