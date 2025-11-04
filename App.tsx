
import React, { useState, useEffect } from 'react';
import { useTranslation } from './hooks/useTranslation';
import { Patient, Appointment, Prescription, AppSettings } from './types';
import { initializeMockApi } from './services/mockApi';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import AppointmentScheduler from './components/AppointmentScheduler';
import PrescriptionWriter from './components/PrescriptionWriter';
import SymptomAnalyzer from './components/SymptomAnalyzer';
import MedicalCalculators from './components/MedicalCalculators';
import DrugInteractionChecker from './components/DrugInteractionChecker';
import ClinicalDecisionSupport from './components/ClinicalDecisionSupport';
import PracticeAnalytics from './components/PracticeAnalytics';
import AdvancedReports from './components/AdvancedReports';
import DoctorSettings from './components/DoctorSettings';


const App: React.FC = () => {
    const { t, language, changeLanguage } = useTranslation();
    const [currentView, setCurrentView] = useState('dashboard');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeMockApi();
        loadInitialData();
    }, []);

    useEffect(() => {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    }, [language]);


    const loadInitialData = async () => {
        try {
            const [patientsData, appointmentsData, prescriptionsData, settingsData] = await Promise.all([
                (window as any).electronAPI.getPatients(),
                (window as any).electronAPI.getAppointments(),
                (window as any).electronAPI.getPrescriptions(),
                (window as any).electronAPI.getSettings(),
            ]);
            setPatients(patientsData || []);
            setAppointments(appointmentsData || []);
            setPrescriptions(prescriptionsData || []);
            setSettings(settingsData);
            // FIX: Access language from settings.preferences.language
            if (settingsData?.preferences?.language) {
                changeLanguage(settingsData.preferences.language);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSetPatients = (updatedPatients: Patient[]) => {
      setPatients(updatedPatients);
      (window as any).electronAPI.savePatients(updatedPatients);
    }
    
    const handleSetAppointments = (updatedAppointments: Appointment[]) => {
      setAppointments(updatedAppointments);
      (window as any).electronAPI.saveAppointments(updatedAppointments);
    }

    const handleSetPrescriptions = (updatedPrescriptions: Prescription[]) => {
        setPrescriptions(updatedPrescriptions);
        (window as any).electronAPI.savePrescriptions(updatedPrescriptions);
    }
    
    const handleSetSettings = (updatedSettings: AppSettings) => {
        setSettings(updatedSettings);
        (window as any).electronAPI.saveSettings(updatedSettings);
        // FIX: Access language from updatedSettings.preferences.language
        if (updatedSettings.preferences.language !== language) {
            changeLanguage(updatedSettings.preferences.language);
        }
    };

    const handleRestoreData = async (data: any) => {
        // Basic validation
        if (data && data.patients && data.appointments && data.prescriptions && data.settings) {
            await (window as any).electronAPI.restoreAllData(data);
            alert(t('restoreSuccess'));
            window.location.reload();
        } else {
            throw new Error('Invalid backup file format.');
        }
    };

    const renderView = () => {
        switch(currentView) {
            case 'patients':
                return <PatientManagement patients={patients} onPatientsUpdate={handleSetPatients} />;
            case 'appointments':
                return <AppointmentScheduler appointments={appointments} onAppointmentsUpdate={handleSetAppointments} patients={patients} settings={settings} />;
            case 'prescriptions':
                return <PrescriptionWriter patients={patients} prescriptions={prescriptions} onPrescriptionsUpdate={handleSetPrescriptions} />;
            case 'symptoms':
                return <SymptomAnalyzer />;
            case 'calculators':
                return <MedicalCalculators />;
            case 'interactions':
                return <DrugInteractionChecker />;
            case 'cds':
                return <ClinicalDecisionSupport patients={patients} />;
            case 'analytics':
                return <PracticeAnalytics />;
            case 'advanced-reports':
                return <AdvancedReports patients={patients} appointments={appointments} prescriptions={prescriptions} />;
            case 'settings':
                return <DoctorSettings settings={settings} onSettingsUpdate={handleSetSettings} onRestoreData={handleRestoreData} />;
            case 'dashboard':
            default:
                return <Dashboard patients={patients} appointments={appointments} prescriptions={prescriptions} setCurrentView={setCurrentView} />;
        }
    };

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white flex-col">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
                <h2 className="mt-4 text-xl font-semibold">Loading Digital Doctor...</h2>
            </div>
        );
    }

    return (
        <div className={`flex h-screen bg-gray-100 ${language === 'fa' ? 'rtl' : 'ltr'}`}>
            <Sidebar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="p-4 md:p-8">
                        {renderView()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;