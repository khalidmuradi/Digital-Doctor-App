import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Prescription, Patient, Medication } from '../types';

const initialMedication: Medication = { 
    name: '', 
    dosage: '', 
    frequency: '', 
    duration: '', 
    instructions: '',
    form: 'tablet'
};

const initialFormData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'> = {
    patient_id: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    medications: [initialMedication],
    instructions: '',
    notes: '',
    status: 'active'
};

const commonMedications = [
    { name: 'Amoxicillin', forms: ['capsule', 'suspension'], commonDosage: '500mg' },
    { name: 'Lisinopril', forms: ['tablet'], commonDosage: '10mg' },
    { name: 'Metformin', forms: ['tablet'], commonDosage: '500mg' },
    { name: 'Atorvastatin', forms: ['tablet'], commonDosage: '20mg' },
    { name: 'Levothyroxine', forms: ['tablet'], commonDosage: '50mcg' },
    { name: 'Amlodipine', forms: ['tablet'], commonDosage: '5mg' },
    { name: 'Omeprazole', forms: ['capsule'], commonDosage: '20mg' },
    { name: 'Albuterol', forms: ['inhaler'], commonDosage: '100mcg' },
    { name: 'Ibuprofen', forms: ['tablet', 'suspension'], commonDosage: '400mg' },
    { name: 'Paracetamol', forms: ['tablet', 'suspension'], commonDosage: '500mg' }
];

const PrescriptionWriter: React.FC<{ prescriptions: Prescription[], onPrescriptionsUpdate: (prescriptions: Prescription[]) => void, patients: Patient[] }> = ({ prescriptions, onPrescriptionsUpdate, patients }) => {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [formData, setFormData] = useState<Omit<Prescription, 'id' | 'created_at' | 'updated_at'>>(initialFormData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingPrescription(null);
        setShowForm(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPrescription) {
            const updatedPrescription = { ...editingPrescription, ...formData, updated_at: new Date().toISOString() };
            onPrescriptionsUpdate(prescriptions.map(p => p.id === editingPrescription.id ? updatedPrescription : p));
        } else {
            const newPrescription: Prescription = {
                id: Date.now().toString(),
                ...formData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            onPrescriptionsUpdate([...prescriptions, newPrescription]);
        }
        resetForm();
    };

    const handleEdit = (prescription: Prescription) => {
        setEditingPrescription(prescription);
        setFormData(prescription);
        setShowForm(true);
    };

    const handleDelete = (prescriptionId: string) => {
        if (window.confirm(t('deletePrescriptionConfirmation'))) {
            onPrescriptionsUpdate(prescriptions.filter(p => p.id !== prescriptionId));
        }
    };
    
    const addMedication = () => setFormData(prev => ({...prev, medications: [...prev.medications, initialMedication]}));
    
    const removeMedication = (index: number) => {
        if (formData.medications.length > 1) {
            setFormData(prev => ({...prev, medications: prev.medications.filter((_, i) => i !== index)}));
        }
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const updatedMedications = formData.medications.map((med, i) => i === index ? { ...med, [field]: value } : med);
        setFormData(prev => ({ ...prev, medications: updatedMedications }));
    };

    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || t('unknownPatient');

    const printPrescription = (prescription: Prescription) => {
      // Implementation from HTML file
    };
    
    const markAsCompleted = (id: string) => {
        onPrescriptionsUpdate(prescriptions.map(p => p.id === id ? {...p, status: 'completed'} : p));
    };

    const filteredPrescriptions = prescriptions.filter(pr => {
        const matchesSearch = searchTerm === '' ||
            getPatientName(pr.patient_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || pr.status === filterStatus;
        return matchesSearch && matchesStatus;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">{t('prescriptionWriter')}</h1>
                {!showForm && (
                     <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        {t('newPrescription')}
                    </button>
                )}
            </div>
            
            {showForm && (
                <PrescriptionForm
                    formData={formData}
                    setFormData={setFormData}
                    patients={patients}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isEditing={!!editingPrescription}
                    addMedication={addMedication}
                    removeMedication={removeMedication}
                    updateMedication={updateMedication}
                />
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                     <h2 className="text-xl font-bold text-gray-800">{t('prescriptionHistory')}</h2>
                     <div className="flex gap-4">
                        <input type="text" placeholder={t('searchPrescriptions')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 p-2 border border-gray-300 rounded-lg" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border border-gray-300 rounded-lg bg-white">
                             <option value="all">{t('allStatus')}</option>
                             <option value="active">{t('active')}</option>
                             <option value="completed">{t('completed')}</option>
                             <option value="cancelled">{t('cancelled')}</option>
                             <option value="expired">{t('expired')}</option>
                        </select>
                     </div>
                </div>
                
                <PrescriptionList 
                    prescriptions={filteredPrescriptions}
                    getPatientName={getPatientName}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onComplete={markAsCompleted}
                    onPrint={printPrescription}
                />
            </div>
        </div>
    );
};

const PrescriptionForm: React.FC<{
    formData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    patients: Patient[];
    onSave: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing: boolean;
    addMedication: () => void;
    removeMedication: (index: number) => void;
    updateMedication: (index: number, field: keyof Medication, value: string) => void;
}> = ({ formData, setFormData, patients, onSave, onCancel, isEditing, addMedication, removeMedication, updateMedication }) => {
    const { t } = useTranslation();

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
             <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? t('editPrescription') : t('newPrescription')}</h2>
             <form onSubmit={onSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectField label={t('patient')} value={formData.patient_id} onChange={e => handleInputChange('patient_id', e.target.value)} required>
                        <option value="">{t('selectPatient')}</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </SelectField>
                    <InputField label={t('date')} type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} required />
                    <SelectField label={t('status')} value={formData.status} onChange={e => handleInputChange('status', e.target.value)}>
                        <option value="active">{t('active')}</option>
                        <option value="completed">{t('completed')}</option>
                        <option value="cancelled">{t('cancelled')}</option>
                        <option value="expired">{t('expired')}</option>
                    </SelectField>
                </div>
                <InputField label={t('diagnosis')} value={formData.diagnosis} onChange={e => handleInputChange('diagnosis', e.target.value)} placeholder={t('enterDiagnosis')} required />

                {/* Medications */}
                <div className="space-y-4 border-t pt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-blue-600">{t('medications')}</h3>
                        <button type="button" onClick={addMedication} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">{t('addMedication')}</button>
                    </div>
                    {formData.medications.map((med, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4 relative">
                            {formData.medications.length > 1 && (
                                <button type="button" onClick={() => removeMedication(index)} className="absolute top-2 right-2 rtl:left-2 rtl:right-auto text-red-500 hover:text-red-700 text-xs font-bold">
                                    {t('remove')}
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               <InputField label={t('medicationName')} value={med.name} onChange={e => updateMedication(index, 'name', e.target.value)} required />
                               <SelectField label={t('form')} value={med.form} onChange={e => updateMedication(index, 'form', e.target.value as Medication['form'])}>
                                    <option value="tablet">{t('tablet')}</option>
                                    <option value="capsule">{t('capsule')}</option>
                                    <option value="syrup">{t('syrup')}</option>
                                    <option value="injection">{t('injection')}</option>
                                    <option value="ointment">{t('ointment')}</option>
                                    <option value="inhaler">{t('inhaler')}</option>
                                    <option value="drops">{t('drops')}</option>
                                    <option value="suspension">{t('suspension')}</option>
                                </SelectField>
                                <InputField label={t('dosage')} value={med.dosage} onChange={e => updateMedication(index, 'dosage', e.target.value)} placeholder={t('dosagePlaceholder')} />
                                <SelectField label={t('frequency')} value={med.frequency} onChange={e => updateMedication(index, 'frequency', e.target.value)}>
                                    <option value="">{t('selectFrequency')}</option>
                                    <option value="Once daily">{t('onceDaily')}</option>
                                    <option value="Twice daily">{t('twiceDaily')}</option>
                                    <option value="Three times daily">{t('threeTimesDaily')}</option>
                                </SelectField>
                                <InputField label={t('duration')} value={med.duration} onChange={e => updateMedication(index, 'duration', e.target.value)} placeholder={t('durationPlaceholder')} />
                            </div>
                            <InputField label={t('specialInstructions')} value={med.instructions || ''} onChange={e => updateMedication(index, 'instructions', e.target.value)} placeholder={t('instructionsPlaceholder')} />
                        </div>
                    ))}
                </div>

                <TextAreaField label={t('additionalInstructions')} value={formData.instructions || ''} onChange={e => handleInputChange('instructions', e.target.value)} placeholder={t('generalInstructions')} />
                <TextAreaField label={t('internalNotes')} value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} placeholder={t('internalNotesPlaceholder')} />

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">{t('cancel')}</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{isEditing ? t('updatePrescription') : t('createPrescription')}</button>
                </div>
             </form>
        </div>
    );
}

const PrescriptionList: React.FC<{
    prescriptions: Prescription[];
    getPatientName: (id: string) => string;
    onEdit: (p: Prescription) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
    onPrint: (p: Prescription) => void;
}> = ({ prescriptions, getPatientName, onEdit, onDelete, onComplete, onPrint }) => {
    const { t } = useTranslation();

    if (prescriptions.length === 0) {
        return <p className="text-center text-gray-500 py-8">{t('noPrescriptionsFound')}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('date')}</th>
                        <th scope="col" className="px-6 py-3">{t('patient')}</th>
                        <th scope="col" className="px-6 py-3">{t('diagnosis')}</th>
                        <th scope="col" className="px-6 py-3">{t('medications')}</th>
                        <th scope="col" className="px-6 py-3">{t('status')}</th>
                        <th scope="col" className="px-6 py-3">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map(pr => (
                        <tr key={pr.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{pr.date}</td>
                            <td className="px-6 py-4 font-semibold">{getPatientName(pr.patient_id)}</td>
                            <td className="px-6 py-4">{pr.diagnosis}</td>
                            <td className="px-6 py-4">
                                {pr.medications[0]?.name}{pr.medications.length > 1 ? ` +${pr.medications.length - 1} ${t('more')}`: ''}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {t(pr.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 flex flex-wrap gap-2">
                                <button onClick={() => onPrint(pr)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">{t('print')}</button>
                                <button onClick={() => onEdit(pr)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">{t('edit')}</button>
                                {pr.status === 'active' && <button onClick={() => onComplete(pr.id)} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">{t('complete')}</button>}
                                <button onClick={() => onDelete(pr.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">{t('delete')}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Reusable Form Components
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">{label}</label>
        <textarea {...props} rows={2} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);


export default PrescriptionWriter;
