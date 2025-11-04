import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const SymptomAnalyzer: React.FC = () => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [patientInfo, setPatientInfo] = useState({
        age: '',
        gender: '',
        weight: '',
        height: '',
        knownConditions: '',
        currentMedications: '',
        allergies: ''
    });
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [symptomDetails, setSymptomDetails] = useState<Record<string, Record<string, string>>>({});
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // Symptom database with categories and severity options - now using translations
    const symptomCategories = [
        {
            category: t('generalCategory'),
            symptoms: [
                { id: 'fever', name: t('fever'), questions: [t('feverQuestion1'), t('feverQuestion2')] },
                { id: 'fatigue', name: t('fatigue'), questions: [t('fatigueQuestion1'), t('fatigueQuestion2')] },
                { id: 'weightLoss', name: t('weightLoss'), questions: [t('weightLossQuestion1'), t('weightLossQuestion2')] },
                { id: 'nightSweats', name: t('nightSweats'), questions: [t('nightSweatsQuestion1'), t('nightSweatsQuestion2')] }
            ]
        },
        {
            category: t('respiratoryCategory'),
            symptoms: [
                { id: 'cough', name: t('cough'), questions: [t('coughQuestion1'), t('coughQuestion2'), t('coughQuestion3')] },
                { id: 'shortnessBreath', name: t('shortnessBreath'), questions: [t('shortnessBreathQuestion1'), t('shortnessBreathQuestion2')] },
                { id: 'chestPain', name: t('chestPain'), questions: [t('chestPainQuestion1'), t('chestPainQuestion2'), t('chestPainQuestion3')] },
                { id: 'wheezing', name: t('wheezing'), questions: [t('wheezingQuestion1'), t('wheezingQuestion2')] }
            ]
        },
        {
            category: t('cardiovascularCategory'),
            symptoms: [
                { id: 'palpitations', name: t('palpitations'), questions: [t('palpitationsQuestion1'), t('palpitationsQuestion2')] },
                { id: 'swelling', name: t('swelling'), questions: [t('swellingQuestion1'), t('swellingQuestion2')] },
                { id: 'dizziness', name: t('dizziness'), questions: [t('dizzinessQuestion1'), t('dizzinessQuestion2')] }
            ]
        },
        {
            category: t('gastrointestinalCategory'),
            symptoms: [
                { id: 'nausea', name: t('nausea'), questions: [t('nauseaQuestion1'), t('nauseaQuestion2')] },
                { id: 'abdominalPain', name: t('abdominalPain'), questions: [t('abdominalPainQuestion1'), t('abdominalPainQuestion2'), t('abdominalPainQuestion3')] },
                { id: 'diarrhea', name: t('diarrhea'), questions: [t('diarrheaQuestion1'), t('diarrheaQuestion2'), t('diarrheaQuestion3')] },
                { id: 'constipation', name: t('constipation'), questions: [t('constipationQuestion1'), t('constipationQuestion2')] }
            ]
        },
        {
            category: t('neurologicalCategory'),
            symptoms: [
                { id: 'headache', name: t('headache'), questions: [t('headacheQuestion1'), t('headacheQuestion2'), t('headacheQuestion3')] },
                { id: 'visionChanges', name: t('visionChanges'), questions: [t('visionChangesQuestion1'), t('visionChangesQuestion2')] },
                { id: 'numbness', name: t('numbness'), questions: [t('numbnessQuestion1'), t('numbnessQuestion2')] }
            ]
        }
    ];

    // Medical knowledge base - now using translations
    const medicalKnowledgeBase = {
        'myocardialInfarction': {
            displayName: t('myocardialInfarction'),
            symptoms: ['chestPain', 'shortnessBreath', 'nausea', 'dizziness'],
            severity: 'emergency',
            recommendations: [t('myocardialInfarctionRec1'), t('myocardialInfarctionRec2'), t('myocardialInfarctionRec3')]
        },
        'heartFailure': {
            displayName: t('heartFailure'),
            symptoms: ['shortnessBreath', 'swelling', 'fatigue', 'palpitations'],
            severity: 'high',
            recommendations: [t('heartFailureRec1'), t('heartFailureRec2'), t('heartFailureRec3')]
        },
        'pneumonia': {
            displayName: t('pneumonia'),
            symptoms: ['fever', 'cough', 'shortnessBreath', 'chestPain'],
            severity: 'high',
            recommendations: [t('pneumoniaRec1'), t('pneumoniaRec2'), t('pneumoniaRec3')]
        },
        'influenza': {
            displayName: t('influenza'),
            symptoms: ['fever', 'cough', 'fatigue', 'headache'],
            severity: 'medium',
            recommendations: [t('influenzaRec1'), t('influenzaRec2'), t('influenzaRec3')]
        },
        'gastroenteritis': {
            displayName: t('gastroenteritis'),
            symptoms: ['nausea', 'diarrhea', 'abdominalPain', 'fever'],
            severity: 'medium',
            recommendations: [t('gastroenteritisRec1'), t('gastroenteritisRec2'), t('gastroenteritisRec3')]
        },
        'migraine': {
            displayName: t('migraine'),
            symptoms: ['headache', 'nausea', 'visionChanges'],
            severity: 'medium',
            recommendations: [t('migraineRec1'), t('migraineRec2'), t('migraineRec3')]
        },
        'commonCold': {
            displayName: t('commonCold'),
            symptoms: ['cough', 'fatigue', 'fever'],
            severity: 'low',
            recommendations: [t('commonColdRec1'), t('commonColdRec2'), t('commonColdRec3')]
        },
    };

    const handlePatientInfoChange = (field: keyof typeof patientInfo, value: string) => {
        setPatientInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleSymptomToggle = (symptomId: string) => {
        setSelectedSymptoms(prev => {
            if (prev.includes(symptomId)) {
                // Also remove details when untoggling
                const newDetails = {...symptomDetails};
                delete newDetails[symptomId];
                setSymptomDetails(newDetails);
                return prev.filter(id => id !== symptomId);
            } else {
                return [...prev, symptomId];
            }
        });
    };

    const handleSymptomDetailChange = (symptomId: string, questionIndex: number, value: string) => {
        setSymptomDetails(prev => ({
            ...prev,
            [symptomId]: {
                ...prev[symptomId],
                [questionIndex]: value
            }
        }));
    };

    const analyzeSymptoms = () => {
        setLoading(true);
        setTimeout(() => {
            const matchedConditions: any[] = [];
            Object.keys(medicalKnowledgeBase).forEach(conditionKey => {
                const conditionData = (medicalKnowledgeBase as any)[conditionKey];
                const matchingSymptoms = conditionData.symptoms.filter((s: string) => selectedSymptoms.includes(s));
                if (matchingSymptoms.length > 0) {
                    const matchScore = (matchingSymptoms.length / conditionData.symptoms.length) * 100;
                    if (matchScore > 20) { // Only include if there's a reasonable match
                         matchedConditions.push({
                            condition: conditionData.displayName,
                            matchScore: Math.round(matchScore),
                            severity: conditionData.severity,
                            recommendations: conditionData.recommendations,
                            matchingSymptoms,
                        });
                    }
                }
            });

            const severityOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
            matchedConditions.sort((a, b) => {
                const severityDiff = (severityOrder as any)[b.severity] - (severityOrder as any)[a.severity];
                if (severityDiff !== 0) return severityDiff;
                return b.matchScore - a.matchScore;
            });

            setAnalysisResult({
                conditions: matchedConditions,
                selectedSymptoms,
                symptomDetails,
                patientInfo
            });

            setLoading(false);
            setCurrentStep(2);
        }, 1500);
    };

    const resetAnalyzer = () => {
        setCurrentStep(0);
        setPatientInfo({ age: '', gender: '', weight: '', height: '', knownConditions: '', currentMedications: '', allergies: '' });
        setSelectedSymptoms([]);
        setSymptomDetails({});
        setAnalysisResult(null);
    };

    const getSeverityColor = (severity: string) => ({
        emergency: 'border-red-500 bg-red-50',
        high: 'border-orange-500 bg-orange-50',
        medium: 'border-yellow-500 bg-yellow-50',
        low: 'border-green-500 bg-green-50'
    }[severity] || 'border-gray-300');
    
    const getSeverityPillColor = (severity: string) => ({
        emergency: 'bg-red-500 text-white',
        high: 'bg-orange-500 text-white',
        medium: 'bg-yellow-500 text-gray-800',
        low: 'bg-green-500 text-white'
    }[severity] || 'bg-gray-400');

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-bold">{t('patientInfo')}</h3>
                        <p className="text-sm text-gray-600">{t('patientInfoDescription')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={t('age')} type="number" value={patientInfo.age} onChange={e => handlePatientInfoChange('age', e.target.value)} required />
                            <SelectField label={t('gender')} value={patientInfo.gender} onChange={e => handlePatientInfoChange('gender', e.target.value)} required>
                                <option value="">{t('selectGender')}</option>
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                                <option value="other">{t('other')}</option>
                            </SelectField>
                            <InputField label={t('weight')} type="number" value={patientInfo.weight} onChange={e => handlePatientInfoChange('weight', e.target.value)} />
                            <InputField label={t('height')} type="number" value={patientInfo.height} onChange={e => handlePatientInfoChange('height', e.target.value)} />
                        </div>
                        <TextAreaField label={t('knownConditions')} value={patientInfo.knownConditions} onChange={e => handlePatientInfoChange('knownConditions', e.target.value)} placeholder={t('knownConditionsPlaceholder')} />
                        <TextAreaField label={t('currentMedications')} value={patientInfo.currentMedications} onChange={e => handlePatientInfoChange('currentMedications', e.target.value)} placeholder={t('currentMedicationsPlaceholder')} />
                        <TextAreaField label={t('allergies')} value={patientInfo.allergies} onChange={e => handlePatientInfoChange('allergies', e.target.value)} placeholder={t('allergiesPlaceholder')} />
                        <div className="text-right">
                            <button onClick={() => setCurrentStep(1)} disabled={!patientInfo.age || !patientInfo.gender} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{t('continueToSymptoms')}</button>
                        </div>
                    </div>
                );
            case 1:
                return (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">{t('selectSymptoms')}</h3>
                        <p className="text-sm text-gray-600 mb-6">{t('selectSymptomsDescription')}</p>
                        <div className="space-y-6">
                            {symptomCategories.map(cat => (
                                <div key={cat.category}>
                                    <h4 className="font-semibold text-lg text-blue-600 border-b-2 border-blue-200 pb-2 mb-3">{cat.category}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                        {cat.symptoms.map(symptom => (
                                            <div key={symptom.id}>
                                                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                                                    <input type="checkbox" checked={selectedSymptoms.includes(symptom.id)} onChange={() => handleSymptomToggle(symptom.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                    <span>{symptom.name}</span>
                                                </label>
                                                 {selectedSymptoms.includes(symptom.id) && (
                                                    <div className="pl-6 rtl:pr-6 mt-2 space-y-2">
                                                        {symptom.questions.map((q, i) => (
                                                             <div key={i}>
                                                                <label className="text-xs text-gray-500 block">{q}</label>
                                                                <input
                                                                    type="text"
                                                                    value={symptomDetails[symptom.id]?.[i] || ''}
                                                                    onChange={e => handleSymptomDetailChange(symptom.id, i, e.target.value)}
                                                                    className="w-full text-sm p-1 border-b-2 focus:border-blue-500 outline-none"
                                                                />
                                                             </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-8 border-t pt-6">
                            <button onClick={() => setCurrentStep(0)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">{t('previous')}</button>
                            <button onClick={analyzeSymptoms} disabled={selectedSymptoms.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{t('analyzeSymptoms')}</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    loading ? (
                        <div className="bg-white p-12 rounded-lg shadow-md text-center">
                             <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                            <h3 className="text-xl font-bold mt-4">{t('analyzingSymptoms')}</h3>
                            <p className="text-gray-600">{t('analyzingSymptomsDescription')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold">{t('analysisSummary')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-center">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-3xl font-bold text-blue-600">{analysisResult.conditions.length}</div>
                                        <div className="text-sm text-gray-600">{t('possibleConditions')}</div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-3xl font-bold text-green-600">{analysisResult.selectedSymptoms.length}</div>
                                        <div className="text-sm text-gray-600">{t('symptomsReported')}</div>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-lg">
                                        <div className="text-3xl font-bold text-red-600 capitalize">{t(analysisResult.conditions[0]?.severity || 'low')}</div>
                                        <div className="text-sm text-gray-600">{t('highestPriority')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold mb-4">{t('possibleConditions')}</h3>
                                {analysisResult.conditions.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">{t('noConditionsMatched')}</p>
                                ) : (
                                    <div className="space-y-4">
                                        {analysisResult.conditions.map((res: any, i: number) => (
                                            <div key={i} className={`p-4 border-l-4 rounded-md ${getSeverityColor(res.severity)}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-lg">{res.condition}</h4>
                                                        <p className="text-sm text-gray-500">{t('match')}: {res.matchScore}%</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getSeverityPillColor(res.severity)}`}>{t(res.severity)}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <h5 className="text-sm font-semibold">{t('matchingSymptoms')}:</h5>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {res.matchingSymptoms.map((s_id: string) => {
                                                            const symptomName = symptomCategories.flatMap(c => c.symptoms).find(s => s.id === s_id)?.name;
                                                            return <span key={s_id} className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{symptomName || s_id}</span>
                                                        })}
                                                    </div>
                                                </div>
                                                 <div className="mt-3">
                                                    <h5 className="text-sm font-semibold">{t('recommendations')}:</h5>
                                                    <ul className="list-disc pl-5 rtl:pr-5 mt-1 text-sm text-gray-700 space-y-1">
                                                        {res.recommendations.map((rec: string, j: number) => <li key={j}>{rec}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                             <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md text-sm">
                                <p><strong>{t('disclaimer')}</strong></p>
                            </div>
                        </div>
                    )
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">{t('symptomAnalyzer')}</h1>
                {currentStep > 0 && (
                    <button onClick={resetAnalyzer} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">{t('startOver')}</button>
                )}
            </div>

            {/* Progress Bar */}
             <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse bg-white p-4 rounded-lg shadow-md">
                <Step number={1} label={t('patientInfo')} active={currentStep >= 0} />
                <div className={`flex-1 h-1 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <Step number={2} label={t('symptoms')} active={currentStep >= 1} />
                <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <Step number={3} label={t('results')} active={currentStep >= 2} />
            </div>

            {renderStep()}
        </div>
    );
};

const Step: React.FC<{number: number; label: string; active: boolean;}> = ({ number, label, active }) => (
    <div className="flex flex-col items-center space-y-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {number}
        </div>
        <span className={`text-xs font-semibold ${active ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <select {...props} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea {...props} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

export default SymptomAnalyzer;