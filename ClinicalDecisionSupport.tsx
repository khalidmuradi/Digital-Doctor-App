
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Patient } from '../types';

interface ClinicalDecisionSupportProps {
    patients: Patient[];
}

type CDSModuleId = 'hypertension' | 'preventiveCare';

interface CDSResult {
    status: 'atGoal' | 'needsAttention' | 'alert' | 'due';
    findingKey: string;
    findingValue?: string;
    recommendationKey: string;
    source: string;
}

const modules: { id: CDSModuleId; nameKey: string; descKey: string; icon: string; }[] = [
    { id: 'hypertension', nameKey: 'htnModule', descKey: 'htnModuleDesc', icon: '❤️' },
    { id: 'preventiveCare', nameKey: 'preventiveCareModule', descKey: 'preventiveCareModuleDesc', icon: '🛡️' },
];

const ClinicalDecisionSupport: React.FC<ClinicalDecisionSupportProps> = ({ patients }) => {
    const { t } = useTranslation();
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedModule, setSelectedModule] = useState<CDSModuleId | null>(null);
    const [results, setResults] = useState<CDSResult[] | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const handleRunAnalysis = (moduleId: CDSModuleId) => {
        if (!selectedPatient) return;
        setLoading(true);
        setSelectedModule(moduleId);
        setResults(null);

        // Simulate API call and logic
        setTimeout(() => {
            let analysisResults: CDSResult[] = [];
            const patientAge = parseInt(selectedPatient.age, 10);

            if (moduleId === 'hypertension') {
                // Mock a BP reading
                const mockSystolic = 110 + Math.random() * 50;
                const mockDiastolic = 70 + Math.random() * 30;
                const bpTarget = patientAge >= 60 ? 150/90 : 140/90;
                
                if (mockSystolic < bpTarget[0] && mockDiastolic < bpTarget[1]) {
                    analysisResults.push({ status: 'atGoal', findingKey: 'bpAtTarget', findingValue: `${mockSystolic.toFixed(0)}/${mockDiastolic.toFixed(0)} mmHg`, recommendationKey: 'bpAtTargetRec', source: 'JNC 8' });
                } else {
                    analysisResults.push({ status: 'needsAttention', findingKey: 'bpAboveTarget', findingValue: `${mockSystolic.toFixed(0)}/${mockDiastolic.toFixed(0)} mmHg`, recommendationKey: 'bpAboveTargetRec', source: 'JNC 8' });
                }
                analysisResults.push({ status: 'atGoal', findingKey: 'firstLineTherapy', recommendationKey: 'firstLineTherapyRec', source: 'JNC 8' });
            }

            if (moduleId === 'preventiveCare') {
                 if (selectedPatient.gender === 'Female' && patientAge >= 40) {
                    analysisResults.push({ status: 'due', findingKey: 'mammogram', recommendationKey: 'mammogramRec', source: 'USPSTF' });
                }
                if (patientAge >= 45) {
                    analysisResults.push({ status: 'due', findingKey: 'colonoscopy', recommendationKey: 'colonoscopyRec', source: 'USPSTF' });
                }
                 if (patientAge >= 40) {
                    analysisResults.push({ status: 'due', findingKey: 'lipidPanel', recommendationKey: 'lipidPanelRec', source: 'ACC/AHA' });
                }
                 if (patientAge >= 35) {
                    analysisResults.push({ status: 'due', findingKey: 'bloodGlucose', recommendationKey: 'bloodGlucoseRec', source: 'ADA' });
                }
            }

            setResults(analysisResults);
            setLoading(false);
        }, 1500);
    };
    
    const getStatusStyles = (status: CDSResult['status']) => {
        switch (status) {
            case 'atGoal': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', icon: '✓' };
            case 'needsAttention': return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800', icon: '!' };
            case 'alert': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800', icon: '‼' };
            case 'due': return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', icon: '📅' };
            default: return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-800', icon: '•' };
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{t('cdsTitle')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <label className="block text-sm font-medium text-gray-700">{t('selectPatient')}</label>
                        <select
                            value={selectedPatientId}
                            onChange={e => {
                                setSelectedPatientId(e.target.value);
                                setResults(null);
                                setSelectedModule(null);
                            }}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">{t('selectPatient')}</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {selectedPatient && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{t('patientSummary')}</h2>
                             <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>{t('name')}:</strong> {selectedPatient.name}</p>
                                <p><strong>{t('age')}:</strong> {selectedPatient.age} {t('years')}</p>
                                <p><strong>{t('gender')}:</strong> {t(selectedPatient.gender.toLowerCase())}</p>
                                <p><strong>{t('knownConditions')}:</strong> {selectedPatient.pastMedicalHistory || 'N/A'}</p>
                             </div>
                             <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 mt-4">{t('cdsModules')}</h2>
                             <div className="space-y-2">
                                {modules.map(mod => (
                                    <button
                                        key={mod.id}
                                        onClick={() => handleRunAnalysis(mod.id)}
                                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedModule === mod.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                        disabled={loading}
                                    >
                                        <span className="text-2xl">{mod.icon}</span>
                                        <div>
                                            <p className="font-semibold">{t(mod.nameKey)}</p>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md min-h-[30rem]">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('analysisResults')}</h2>
                    
                    {!selectedPatientId ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-gray-500">{t('selectPatientPrompt')}</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
                            <p className="mt-3 text-gray-600">{t('runningAnalysis')}</p>
                        </div>
                    ) : !results ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-gray-500">{t('selectModulePrompt')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result, index) => {
                                const styles = getStatusStyles(result.status);
                                return (
                                    <div key={index} className={`p-4 border-l-4 rounded-md ${styles.border} ${styles.bg}`}>
                                        <div className="flex items-start">
                                            <span className={`mr-3 rtl:ml-3 text-xl font-bold ${styles.text}`}>{styles.icon}</span>
                                            <div className="flex-1">
                                                <h3 className={`font-bold ${styles.text}`}>{t(result.findingKey)} {result.findingValue && `(${result.findingValue})`}</h3>
                                                <p className="text-sm mt-1"><strong>{t('recommendation')}:</strong> {t(result.recommendationKey)}</p>
                                                <p className="text-xs text-gray-500 mt-2"><strong>{t('source')}:</strong> {result.source}</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles.border}`}>{t(`status${result.status.charAt(0).toUpperCase() + result.status.slice(1)}`)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="mt-auto pt-6">
                        <div className="p-3 text-xs bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-md">
                            <strong>{t('disclaimer')}:</strong> {t('interactionDisclaimer')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicalDecisionSupport;
