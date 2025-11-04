
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { AppSettings, User } from '../types';

interface DoctorSettingsProps {
    settings: AppSettings | null;
    onSettingsUpdate: (settings: AppSettings) => void;
    onRestoreData: (data: any) => Promise<void>;
}

const defaultSettings: AppSettings = {
    practice: {
        name: 'Digital Doctor Practice',
        address: '123 Medical Center, Healthcare City',
        phone: '+1 (555) 123-4567',
        email: 'contact@digitaldoctor.example.com',
        website: 'www.digitaldoctor.example.com',
        license: 'MED123456789',
        taxId: '12-3456789'
    },
    preferences: {
        language: 'en',
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        autoLogout: 30,
        defaultView: 'dashboard',
        defaultAppointmentReminder: '1hr',
    },
    clinical: {
        defaultMedicationDuration: 7,
        autoCalculateBMI: true,
        showDrugInteractions: true,
        enableClinicalAlerts: true,
        requireReasonForVisit: true
    },
    notifications: {
        emailAppointments: true,
        emailPrescriptions: true,
        smsReminders: true,
        pushNotifications: true,
        lowStockAlerts: true
    },
    billing: {
        currency: 'USD',
        taxRate: 0,
        invoicePrefix: 'INV-',
        paymentTerms: 'Due on receipt',
        lateFeePercentage: 1.5
    },
    security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        autoBackup: true
    }
};

const DoctorSettings: React.FC<DoctorSettingsProps> = ({ settings, onSettingsUpdate, onRestoreData }) => {
    // FIX: Destructure language and changeLanguage from useTranslation, not i18n
    const { t, language, changeLanguage } = useTranslation();
    const [activeTab, setActiveTab] = useState('practice');
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings || defaultSettings);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [backupStatus, setBackupStatus] = useState<any>({});

    useEffect(() => {
        setLocalSettings(settings || defaultSettings);
    }, [settings]);

    useEffect(() => {
        loadUsers();
        checkBackupStatus();
    }, []);

    const loadUsers = () => {
        const mockUsers: User[] = [
            { id: 1, name: 'Dr. Sarah Johnson', email: 's.johnson@example.com', role: 'admin', status: 'active', lastLogin: '2023-12-15 09:23:45', specialization: 'General Practice' },
            { id: 2, name: 'Dr. Michael Chen', email: 'm.chen@example.com', role: 'doctor', status: 'active', lastLogin: '2023-12-14 14:12:33', specialization: 'Cardiology' },
            { id: 3, name: 'Nurse Emily Davis', email: 'e.davis@example.com', role: 'nurse', status: 'active', lastLogin: '2023-12-15 08:45:12', specialization: 'Nursing' },
            { id: 4, name: 'Receptionist Mark Wilson', email: 'm.wilson@example.com', role: 'receptionist', status: 'inactive', lastLogin: '2023-11-20 16:30:22', specialization: 'Administration' }
        ];
        setUsers(mockUsers);
    };

    const checkBackupStatus = () => {
        setBackupStatus({
            lastBackup: '2023-12-15 02:00:00',
            nextBackup: '2023-12-16 02:00:00',
            backupSize: '45.2 MB',
            status: 'success'
        });
    };

    const handleSettingChange = (category: keyof AppSettings, field: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [category]: {
                ...(prev as any)[category],
                [field]: value
            }
        }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSettingsUpdate(localSettings);
            setSaveMessage(t('settings_saved_success'));
            // FIX: Use language and changeLanguage from the useTranslation hook
            if (localSettings.preferences.language !== language) {
                changeLanguage(localSettings.preferences.language);
            }
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage(t('settings_save_error'));
        }
        setSaving(false);
    };

    const resetSettings = () => {
        if (window.confirm(t('confirm_reset_settings'))) {
            onSettingsUpdate(defaultSettings);
            setSaveMessage(t('settings_reset_success'));
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const exportData = async () => {
        try {
            const data = await (window as any).electronAPI.backupAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `digital-doctor-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSaveMessage(t('export_success'));
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    const importData = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                if (!window.confirm(t('restoreWarning'))) {
                    if (event.target) event.target.value = '';
                    return;
                }
                await onRestoreData(data);
                // App will reload from onRestoreData handler
            } catch (error) {
                console.error("Import failed: ", error);
                setSaveMessage(t('import_error'));
                setTimeout(() => setSaveMessage(''), 3000);
            } finally {
                 if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const tabs = [
        { id: 'practice', name: t('practice_info'), icon: '🏥' },
        { id: 'preferences', name: t('preferences'), icon: '⚙️' },
        { id: 'clinical', name: t('clinical_settings'), icon: '🩺' },
        { id: 'notifications', name: t('notifications'), icon: '🔔' },
        { id: 'billing', name: t('billing'), icon: '💰' },
        { id: 'security', name: t('security'), icon: '🔒' },
        { id: 'users', name: t('user_management'), icon: '👥' },
        { id: 'backup', name: t('backup_data'), icon: '💾' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold">{t('doctor_settings')}</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" onClick={resetSettings}>
                        {t('reset_defaults')}
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300" onClick={saveSettings} disabled={saving}>
                        {saving ? t('saving') : t('save_settings')}
                    </button>
                </div>
            </div>

            {saveMessage && (
                <div className={`p-4 rounded-md text-center border ${saveMessage.includes('Error') ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                    {saveMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3 px-2">{t('settings')}</h3>
                    <div className="space-y-1">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                                <span className="text-2xl">{tab.icon}</span>
                                <span className="font-semibold">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    {/* Practice Info */}
                    {activeTab === 'practice' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">{t('practice_info')}</h3>
                            <p className="text-sm text-gray-500">{t('practice_info_desc')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <InputField label={t('practice_name')} value={localSettings.practice.name} onChange={e => handleSettingChange('practice', 'name', e.target.value)} />
                                <InputField label={t('phone_number')} value={localSettings.practice.phone} onChange={e => handleSettingChange('practice', 'phone', e.target.value)} />
                                <TextAreaField className="md:col-span-2" label={t('address')} value={localSettings.practice.address} onChange={e => handleSettingChange('practice', 'address', e.target.value)} />
                                <InputField label={t('email')} type="email" value={localSettings.practice.email} onChange={e => handleSettingChange('practice', 'email', e.target.value)} />
                                <InputField label={t('website')} type="url" value={localSettings.practice.website} onChange={e => handleSettingChange('practice', 'website', e.target.value)} />
                                <InputField label={t('medical_license')} value={localSettings.practice.license} onChange={e => handleSettingChange('practice', 'license', e.target.value)} />
                                <InputField label={t('tax_id')} value={localSettings.practice.taxId} onChange={e => handleSettingChange('practice', 'taxId', e.target.value)} />
                            </div>
                        </div>
                    )}
                    
                     {/* Preferences */}
                    {activeTab === 'preferences' && (
                         <div className="space-y-4">
                            <h3 className="text-xl font-bold">{t('user_preferences')}</h3>
                            <p className="text-sm text-gray-500">{t('user_preferences_desc')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <SelectField label={t('language')} value={localSettings.preferences.language} onChange={e => handleSettingChange('preferences', 'language', e.target.value)}>
                                    <option value="en">English</option>
                                    <option value="fa">دری (Dari)</option>
                                </SelectField>
                                <SelectField label={t('theme')} value={localSettings.preferences.theme} onChange={e => handleSettingChange('preferences', 'theme', e.target.value)}>
                                     <option value="light">{t('theme_light')}</option>
                                     <option value="dark">{t('theme_dark')}</option>
                                     <option value="auto">{t('theme_auto')}</option>
                                 </SelectField>
                                <SelectField label={t('dateFormat')} value={localSettings.preferences.dateFormat} onChange={e => handleSettingChange('preferences', 'dateFormat', e.target.value)}>
                                     <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                     <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                     <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                 </SelectField>
                                 <SelectField label={t('timeFormat')} value={localSettings.preferences.timeFormat} onChange={e => handleSettingChange('preferences', 'timeFormat', e.target.value)}>
                                     <option value="12h">{t('time_12h')}</option>
                                     <option value="24h">{t('time_24h')}</option>
                                 </SelectField>
                                  <SelectField label={t('default_view')} value={localSettings.preferences.defaultView} onChange={e => handleSettingChange('preferences', 'defaultView', e.target.value)}>
                                     <option value="dashboard">{t('dashboard')}</option>
                                     <option value="patients">{t('patientManagement')}</option>
                                     <option value="appointments">{t('appointmentScheduler')}</option>
                                     <option value="prescriptions">{t('prescriptionWriter')}</option>
                                 </SelectField>
                                  <SelectField label={t('defaultAppointmentReminder')} value={localSettings.preferences.defaultAppointmentReminder} onChange={e => handleSettingChange('preferences', 'defaultAppointmentReminder', e.target.value)}>
                                    <option value="none">{t('noReminder')}</option>
                                    <option value="15min">{t('reminder15min')}</option>
                                    <option value="1hr">{t('reminder1hr')}</option>
                                    <option value="24hr">{t('reminder24hr')}</option>
                                </SelectField>
                                 <InputField label={t('auto_logout')} type="number" value={localSettings.preferences.autoLogout} onChange={e => handleSettingChange('preferences', 'autoLogout', parseInt(e.target.value))} min="5"/>
                            </div>
                        </div>
                    )}
                    
                    {/* User Management */}
                    {activeTab === 'users' && (
                         <div>
                             <h3 className="text-xl font-bold">{t('user_management')}</h3>
                             <p className="text-sm text-gray-500 mb-4">{t('user_management_desc')}</p>
                             <div className="flex justify-between items-center mb-4">
                                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ {t('add_new_user')}</button>
                                <span className="text-sm text-gray-600">{users.filter(u => u.status === 'active').length} {t('active_users')}</span>
                             </div>
                             <div className="overflow-x-auto border rounded-lg">
                                 <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left">
                                        <tr>
                                            <th className="p-3 font-semibold">{t('name')}</th>
                                            <th className="p-3 font-semibold">{t('role')}</th>
                                            <th className="p-3 font-semibold">{t('status')}</th>
                                            <th className="p-3 font-semibold">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div>{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="p-3"><span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">{t(`role_${user.role}`)}</span></td>
                                                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{t(user.status)}</span></td>
                                                <td className="p-3 flex gap-2">
                                                    <button className="text-xs px-2 py-1 bg-gray-200 rounded">{t('edit')}</button>
                                                    <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">{t('deactivate')}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                 </table>
                             </div>
                         </div>
                     )}

                    {/* Backup & Data */}
                    {activeTab === 'backup' && (
                         <div>
                             <h3 className="text-xl font-bold">{t('backup_data_management')}</h3>
                             <p className="text-sm text-gray-500 mb-4">{t('backup_data_management_desc')}</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                                    <div className="text-4xl mb-2">💾</div>
                                    <h4 className="font-semibold">{t('export_data')}</h4>
                                    <p className="text-xs text-gray-500 my-2">{t('export_data_desc')}</p>
                                    <button onClick={exportData} className="mt-auto w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">{t('export_now')}</button>
                                </div>
                                <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                                     <div className="text-4xl mb-2">📤</div>
                                     <h4 className="font-semibold">{t('import_data')}</h4>
                                     <p className="text-xs text-gray-500 my-2">{t('import_data_desc')}</p>
                                     <input type="file" id="importFile" accept=".json" onChange={importData} style={{ display: 'none' }} />
                                     <button onClick={() => document.getElementById('importFile')?.click()} className="mt-auto w-full px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300">{t('choose_file')}</button>
                                </div>
                             </div>
                             <div className="mt-4 p-3 text-xs bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-md">
                                 <strong>{t('data_safety_notice')}:</strong> {t('data_safety_desc')}
                             </div>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className={props.className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);


export default DoctorSettings;