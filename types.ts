
export interface Patient {
    id: string;
    name: string;
    dateOfBirth: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    phone: string;
    email?: string;
    address?: string;
    maritalStatus?: string;
    photo?: string; // Added patient photo field
    bloodType?: string;
    allergies?: string;
    currentMedications?: string;
    pastMedicalHistory?: string;
    surgicalHistory?: string;
    familyHistory?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    insuranceProvider?: string;
    insuranceId?: string;
    groupNumber?: string;
    occupation?: string;
    preferredLanguage?: string;
    notes?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface Appointment {
    id: string;
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: number;
    type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'surgery';
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    reason: string;
    notes?: string;
    reminder?: 'none' | '15min' | '1hr' | '24hr';
    created_at: string;
    updated_at: string;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'inhaler' | 'drops' | 'suspension';
}

export interface Prescription {
    id: string;
    patient_id: string;
    date: string;
    diagnosis: string;
    medications: Medication[];
    instructions?: string;
    notes?: string;
    status: 'active' | 'completed' | 'cancelled' | 'expired';
    created_at: string;
    updated_at: string;
}

export interface MedicalRecord {
    id: string;
    date: string;
    type: 'consultation' | 'follow-up' | 'emergency' | 'procedure' | 'lab';
    diagnosis: string;
    treatment: string;
    notes?: string;
    vitalSigns?: {
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        oxygenSaturation: string;
    };
    createdAt: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
    status: 'active' | 'inactive';
    lastLogin: string;
    specialization: string;
}


export interface AppSettings {
    practice: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        license: string;
        taxId: string;
    };
    preferences: {
        language: 'en' | 'fa';
        theme: 'light' | 'dark' | 'auto';
        dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
        timeFormat: '12h' | '24h';
        autoLogout: number;
        defaultView: 'dashboard' | 'patients' | 'appointments' | 'prescriptions';
        defaultAppointmentReminder: 'none' | '15min' | '1hr' | '24hr';
    };
    clinical: {
        defaultMedicationDuration: number;
        autoCalculateBMI: boolean;
        showDrugInteractions: boolean;
        enableClinicalAlerts: boolean;
        requireReasonForVisit: boolean;
    };
    notifications: {
        emailAppointments: boolean;
        emailPrescriptions: boolean;
        smsReminders: boolean;
        pushNotifications: boolean;
        lowStockAlerts: boolean;
    };
    billing: {
        currency: 'USD' | 'EUR' | 'GBP' | 'AFN';
        taxRate: number;
        invoicePrefix: string;
        paymentTerms: string;
        lateFeePercentage: number;
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        passwordExpiry: number;
        loginAttempts: number;
        autoBackup: boolean;
    };
}
