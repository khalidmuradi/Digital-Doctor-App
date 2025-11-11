import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Patient } from '../types';

const initialFormData: Omit<Patient, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
    name: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    maritalStatus: '',
    bloodType: '',
    allergies: '',
    currentMedications: '',
    pastMedicalHistory: '',
    surgicalHistory: '',
    familyHistory: '',
    emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
    },
    insuranceProvider: '',
    insuranceId: '',
    groupNumber: '',
    occupation: '',
    preferredLanguage: '',
    notes: '',
};

const ConfirmationModal: React.FC<{
    patient: Patient;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ patient, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800">{t('deletePatientTitle')}</h2>
                <p className="text-gray-600 my-4">
                    {t('deletePatientMessage').replace('{patientName}', patient.name)}
                </p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                        {t('cancel')}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        {t('confirmDelete')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const PatientManagement: React.FC<{ patients: Patient[]; onPatientsUpdate: (patients: Patient[]) => void; }> = ({ patients, onPatientsUpdate }) => {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<Partial<Patient>>(initialFormData);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const calculateAge = (dob: string): string => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age.toString() : '';
    };

    useEffect(() => {
        if (formData.dateOfBirth) {
            setFormData(prev => ({ ...prev, age: calculateAge(prev.dateOfBirth!) }));
        }
    }, [formData.dateOfBirth]);

    const resetForm = () => {
        setShowForm(false);
        setEditingPatient(null);
        setFormData(initialFormData);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPatient) {
            const updatedPatient = { ...editingPatient, ...formData, updatedAt: new Date().toISOString() };
            onPatientsUpdate(patients.map(p => p.id === editingPatient.id ? updatedPatient : p));
        } else {
            const newPatient: Patient = {
                id: Date.now().toString(),
                ...initialFormData,
                ...formData,
                name: formData.name || 'Unnamed',
                gender: formData.gender || '',
                phone: formData.phone || '',
                dateOfBirth: formData.dateOfBirth || '',
                age: formData.age || '0',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            onPatientsUpdate([...patients, newPatient]);
        }
        resetForm();
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setFormData({
            ...patient,
            emergencyContact: patient.emergencyContact || initialFormData.emergencyContact,
        });
        setShowForm(true);
    };

    const handleDeleteRequest = (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            setPatientToDelete(patient);
        }
    };
    
    const confirmDelete = () => {
        if (patientToDelete) {
            onPatientsUpdate(patients.filter(p => p.id !== patientToDelete.id));
            setPatientToDelete(null);
        }
    };
    
    const filteredPatients = patients.filter(patient => {
        const matchesSearch = searchTerm === '' ||
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm);
        
        const matchesGender = genderFilter === '' || patient.gender === genderFilter;
        
        const matchesStatus = statusFilter === '' || patient.status === statusFilter;

        return matchesSearch && matchesGender && matchesStatus;
    });
    
    return (
        <div className="space-y-6">
            {patientToDelete && (
                <ConfirmationModal
                    patient={patientToDelete}
                    onConfirm={confirmDelete}
                    onCancel={() => setPatientToDelete(null)}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">{t('patientManagement')}</h1>
                <button onClick={() => { setShowForm(true); setEditingPatient(null); setFormData(initialFormData); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    {t('addNewPatient')}
                </button>
            </div>
            
            {showForm ? (
                <PatientForm
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isEditing={!!editingPatient}
                />
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input
                            type="text"
                            placeholder={t('searchPatientsPlaceholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        <select
                            value={genderFilter}
                            onChange={e => setGenderFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">{t('allGenders')}</option>
                            <option value="Male">{t('male')}</option>
                            <option value="Female">{t('female')}</option>
                            <option value="Other">{t('other')}</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">{t('allStatuses')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="inactive">{t('inactive')}</option>
                        </select>
                    </div>
                    {filteredPatients.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            {patients.length > 0 ? t('noPatientsMatchFilters') : t('noPatientsFound')}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPatients.map(patient => (
                                <PatientCard key={patient.id} patient={patient} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PatientCard: React.FC<{patient: Patient, onEdit: (p: Patient) => void, onDelete: (id: string) => void}> = ({patient, onEdit, onDelete}) => {
    const {t} = useTranslation();
    return (
         <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-blue-700">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{t('age')}: {patient.age}, {t('gender')}: {t(patient.gender.toLowerCase())}</p>
                    <p className="text-sm text-gray-600">{t('contact')}: {patient.phone}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t(patient.status)}
                </span>
            </div>
            <div className="mt-4 space-x-2 rtl:space-x-reverse">
                <button onClick={() => onEdit(patient)} className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">{t('edit')}</button>
                <button onClick={() => onDelete(patient.id)} className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded">{t('delete')}</button>
            </div>
        </div>
    )
}

const PatientForm: React.FC<{
    formData: Partial<Patient>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Patient>>>;
    onSave: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing: boolean;
}> = ({ formData, setFormData, onSave, onCancel, isEditing }) => {
    const { t } = useTranslation();

    const handleInputChange = (field: keyof Patient, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleEmergencyContactChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [field]: value,
            },
        }));
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in-down">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? t('editPatient') : t('addNewPatient')}</h2>
            <form onSubmit={onSave}>
                <div className="space-y-8">
                    {/* Sections */}
                    <FormSection title={t('basicInformation')}>
                        <InputField label={t('fullName')} value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} required />
                        <InputField label={t('dateOfBirth')} type="date" value={formData.dateOfBirth || ''} onChange={e => handleInputChange('dateOfBirth', e.target.value)} required />
                        <InputField label={t('age')} value={formData.age || ''} disabled />
                        <SelectField label={t('gender')} value={formData.gender || ''} onChange={e => handleInputChange('gender', e.target.value as Patient['gender'])} required>
                            <option value="">{t('selectGender')}</option>
                            <option value="Male">{t('male')}</option>
                            <option value="Female">{t('female')}</option>
                            <option value="Other">{t('other')}</option>
                        </SelectField>
                        <InputField label={t('maritalStatus')} value={formData.maritalStatus || ''} onChange={e => handleInputChange('maritalStatus', e.target.value)} />
                        <InputField label={t('bloodType')} value={formData.bloodType || ''} onChange={e => handleInputChange('bloodType', e.target.value)} />
                        <InputField label={t('occupation')} value={formData.occupation || ''} onChange={e => handleInputChange('occupation', e.target.value)} />
                        <InputField label={t('preferredLanguage')} value={formData.preferredLanguage || ''} onChange={e => handleInputChange('preferredLanguage', e.target.value)} />
                    </FormSection>

                    <FormSection title={t('contactInformation')}>
                        <InputField label={t('phoneNumber')} type="tel" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} required/>
                        <InputField label={t('emailAddress')} type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                        <TextAreaField label={t('address')} value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} placeholder={t('addressPlaceholder')} />
                    </FormSection>

                    <FormSection title={t('emergencyContact')}>
                        <InputField label={t('emergencyContactName')} value={formData.emergencyContact?.name || ''} onChange={e => handleEmergencyContactChange('name', e.target.value)} />
                        <InputField label={t('relationship')} value={formData.emergencyContact?.relationship || ''} onChange={e => handleEmergencyContactChange('relationship', e.target.value)} />
                        <InputField label={t('emergencyContactPhone')} type="tel" value={formData.emergencyContact?.phone || ''} onChange={e => handleEmergencyContactChange('phone', e.target.value)} />
                    </FormSection>
                    
                    <FormSection title={t('medicalInformation')}>
                         <TextAreaField label={t('allergies')} value={formData.allergies || ''} onChange={e => handleInputChange('allergies', e.target.value)} placeholder={t('allergiesPlaceholder')} />
                         <TextAreaField label={t('currentMedications')} value={formData.currentMedications || ''} onChange={e => handleInputChange('currentMedications', e.target.value)} placeholder={t('medicationsPlaceholder')} />
                         <TextAreaField label={t('pastMedicalHistory')} value={formData.pastMedicalHistory || ''} onChange={e => handleInputChange('pastMedicalHistory', e.target.value)} placeholder={t('medicalHistoryPlaceholder')} />
                         <TextAreaField label={t('surgicalHistory')} value={formData.surgicalHistory || ''} onChange={e => handleInputChange('surgicalHistory', e.target.value)} placeholder={t('surgicalHistoryPlaceholder')} />
                         <TextAreaField label={t('familyMedicalHistory')} value={formData.familyHistory || ''} onChange={e => handleInputChange('familyHistory', e.target.value)} placeholder={t('familyHistoryPlaceholder')} />
                    </FormSection>

                     <FormSection title={t('insuranceInformation')}>
                        <InputField label={t('insuranceProvider')} value={formData.insuranceProvider || ''} onChange={e => handleInputChange('insuranceProvider', e.target.value)} />
                        <InputField label={t('insuranceId')} value={formData.insuranceId || ''} onChange={e => handleInputChange('insuranceId', e.target.value)} />
                        <InputField label={t('groupNumber')} value={formData.groupNumber || ''} onChange={e => handleInputChange('groupNumber', e.target.value)} />
                    </FormSection>

                    <FormSection title={t('additionalInformation')}>
                        <TextAreaField label={t('additionalNotes')} value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} placeholder={t('notesPlaceholder')} rows={4} />
                    </FormSection>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">{t('cancel')}</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{t('savePatient')}</button>
                </div>
            </form>
        </div>
    );
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border-t pt-6">
        <legend className="text-xl font-semibold mb-4 text-blue-600 -mt-10 px-2 bg-white">{title}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </fieldset>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <select {...props} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to shrink if text is deleted
            textarea.style.height = 'auto';
            // Set height to scroll height to expand
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]); // Dependency on value to re-calculate on change

    return (
        <div className="flex flex-col md:col-span-2 lg:col-span-3">
            <label className="mb-1 font-semibold text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
            <textarea
                ref={textareaRef}
                {...props}
                rows={props.rows || 2}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-hidden resize-none transition-height duration-150"
            />
        </div>
    );
};


export default PatientManagement;