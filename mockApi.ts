
import { Patient, Appointment, Prescription, AppSettings } from '../types';

// FIX: Expanded defaultSettings to fully match the AppSettings interface.
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
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
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
        smsReminders: false,
        pushNotifications: false,
        lowStockAlerts: false,
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

const getAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const initializeMockApi = () => {
    if ((window as any).electronAPI) {
        return;
    }

    console.log("Initializing Mock API for browser environment...");

    (window as any).electronAPI = {
        // Patient data
        getPatients: async (): Promise<Patient[]> => {
            const data = localStorage.getItem('digitalDoctorPatients');
            return data ? JSON.parse(data) : [];
        },
        savePatients: async (patients: Patient[]): Promise<void> => {
            localStorage.setItem('digitalDoctorPatients', JSON.stringify(patients));
        },
        
        // Appointment data
        getAppointments: async (): Promise<Appointment[]> => {
            const data = localStorage.getItem('digitalDoctorAppointments');
            return data ? JSON.parse(data) : [];
        },
        saveAppointments: async (appointments: Appointment[]): Promise<void> => {
            localStorage.setItem('digitalDoctorAppointments', JSON.stringify(appointments));
        },
        
        // Prescription data
        getPrescriptions: async (): Promise<Prescription[]> => {
            const data = localStorage.getItem('digitalDoctorPrescriptions');
            return data ? JSON.parse(data) : [];
        },
        savePrescriptions: async (prescriptions: Prescription[]): Promise<void> => {
            localStorage.setItem('digitalDoctorPrescriptions', JSON.stringify(prescriptions));
        },
        
        // Settings data
        getSettings: async (): Promise<AppSettings> => {
            const data = localStorage.getItem('digitalDoctorSettings');
            if (data) {
                const parsed = JSON.parse(data);
                // Merge with defaults to ensure new settings are not missing
                return { ...defaultSettings, ...parsed };
            }
            return defaultSettings;
        },
        saveSettings: async (settings: AppSettings): Promise<void> => {
            localStorage.setItem('digitalDoctorSettings', JSON.stringify(settings));
        },

        // Backup and Restore
        backupAllData: async () => {
            const patients = await (window as any).electronAPI.getPatients();
            const appointments = await (window as any).electronAPI.getAppointments();
            const prescriptions = await (window as any).electronAPI.getPrescriptions();
            const settings = await (window as any).electronAPI.getSettings();
            return { patients, appointments, prescriptions, settings };
        },
        restoreAllData: async (data: { patients: Patient[], appointments: Appointment[], prescriptions: Prescription[], settings: AppSettings }) => {
            await (window as any).electronAPI.savePatients(data.patients || []);
            await (window as any).electronAPI.saveAppointments(data.appointments || []);
            await (window as any).electronAPI.savePrescriptions(data.prescriptions || []);
            await (window as any).electronAPI.saveSettings(data.settings || defaultSettings);
        },

        // Mock other API calls from provided code
        getAdvancedAnalytics: async () => ({
            totalPatients: JSON.parse(localStorage.getItem('digitalDoctorPatients') || '[]').length,
            totalAppointments: JSON.parse(localStorage.getItem('digitalDoctorAppointments') || '[]').length,
            patientRetentionRate: 88.5,
        }),
        getPatientDemographicsReport: async ({ patients, filters }: { patients: Patient[], filters: any }) => {
            const filteredPatients = patients.filter(p => {
                const patientDate = new Date(p.createdAt);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                return patientDate >= startDate && patientDate <= endDate;
            });

            if (filteredPatients.length === 0) return null;

            const totalAge = filteredPatients.reduce((sum, p) => sum + getAge(p.dateOfBirth), 0);
            const genderDistribution = filteredPatients.reduce((acc, p) => {
                acc[p.gender || 'Other'] = (acc[p.gender || 'Other'] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const statusDistribution = filteredPatients.reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            return {
                summary: {
                    totalPatients: filteredPatients.length,
                    averageAge: Math.round(totalAge / filteredPatients.length) || 0,
                    activePatients: statusDistribution['active'] || 0,
                    inactivePatients: statusDistribution['inactive'] || 0,
                },
                charts: {
                    gender: Object.entries(genderDistribution).map(([name, value]) => ({ name, value })),
                },
                tableData: filteredPatients,
            };
        },
        getAppointmentAnalysisReport: async ({ appointments, filters }: { appointments: Appointment[], filters: any }) => {
            const filteredAppointments = appointments.filter(a => {
                const apptDate = new Date(a.appointment_date);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                return apptDate >= startDate && apptDate <= endDate;
            });

            if (filteredAppointments.length === 0) return null;
            
            const statusDistribution = filteredAppointments.reduce((acc, a) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const typeDistribution = filteredAppointments.reduce((acc, a) => {
                acc[a.type] = (acc[a.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const timeDistribution = filteredAppointments.reduce((acc, a) => {
                const hour = a.appointment_time.split(':')[0];
                acc[hour] = (acc[hour] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const peakHour = Object.entries(timeDistribution).sort((a,b) => b[1] - a[1])[0]?.[0];

            return {
                summary: {
                    totalAppointments: filteredAppointments.length,
                    peakTime: peakHour ? `${peakHour}:00 - ${peakHour}:59` : 'N/A',
                    noShowCount: statusDistribution['no-show'] || 0,
                    completedCount: statusDistribution['completed'] || 0,
                },
                charts: {
                    status: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
                    type: Object.entries(typeDistribution).map(([name, value]) => ({ name, value })),
                },
                tableData: filteredAppointments,
            };
        },
        getComplianceReports: async () => ([]),
        getClinicalAnalytics: async () => ({ topDiagnoses: [], topMedicines: [] }),
        exportReportPDF: async (reportType: string, reportData: any) => {
            console.log('Mock Export PDF:', { reportType, reportData });
            alert('Mock PDF export successful!');
        },
        exportReportCSV: async (reportType: string, reportData: any) => {
            console.log('Mock Export CSV:', { reportType, reportData });
            alert('Mock CSV export successful!');
        },
        exportReportExcel: async (reportType: string, reportData: any) => {
            console.log('Mock Export Excel:', { reportType, reportData });
            alert('Mock Excel export successful!');
        },
    };
};