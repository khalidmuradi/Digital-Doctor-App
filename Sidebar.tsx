
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, collapsed, setCollapsed }) => {
    const { t, language, changeLanguage } = useTranslation();

    const menuItems = [
        { id: 'dashboard', label: t('dashboard'), icon: '📊' },
        { id: 'patients', label: t('patientManagement'), icon: '👥' },
        { id: 'appointments', label: t('appointmentScheduler'), icon: '📅' },
        { id: 'prescriptions', label: t('prescriptionWriter'), icon: '💊' },
        { id: 'symptoms', label: t('symptomAnalyzer'), icon: '🔍' },
        { id: 'calculators', label: t('medicalCalculators'), icon: '🧮' },
        { id: 'interactions', label: t('drugInteractionChecker'), icon: '💊' }, // Simplified icon
        { id: 'cds', label: t('clinicalDecisionSupport'), icon: '🩺' },
        { id: 'analytics', label: t('practiceAnalytics'), icon: '📈' },
        { id: 'advanced-reports', label: t('advancedReports'), icon: '📋' },
        { id: 'settings', label: t('settings'), icon: '⚙️' },
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'fa', name: 'دری (Dari)' }
    ];

    return (
        <div className={`flex flex-col bg-gray-800 text-gray-200 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
                {!collapsed && <span className="text-xl font-bold text-white">Digital Doctor</span>}
                <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }}
                        className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-700 ${currentView === item.id ? 'bg-blue-600 text-white' : ''} ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        {!collapsed && <span className="ml-3 rtl:mr-3">{item.label}</span>}
                    </a>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-700">
                {collapsed ? (
                     <select 
                        value={language} 
                        onChange={e => changeLanguage(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-md p-1 text-sm"
                     >
                         <option value="en">EN</option>
                         <option value="fa">FA</option>
                     </select>
                ) : (
                    <select 
                        value={language} 
                        onChange={e => changeLanguage(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
