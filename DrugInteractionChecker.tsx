import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Define types for clarity
interface Interaction {
  pair: [string, string];
  severity: 'Major' | 'Moderate' | 'Minor';
  summaryKey: string;
  managementKey: string;
}

const DrugInteractionChecker: React.FC = () => {
    const { t } = useTranslation();
    const [drugs, setDrugs] = useState<string[]>(['', '']);
    const [results, setResults] = useState<Interaction[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false); // To distinguish initial state from "no results found"

    // Mock interaction database
    const interactionDB: { [key: string]: Omit<Interaction, 'pair'> } = {
        'aspirin-warfarin': { severity: 'Major', summaryKey: 'interaction_warfarin_aspirin_summary', managementKey: 'interaction_warfarin_aspirin_management' },
        'ibuprofen-warfarin': { severity: 'Major', summaryKey: 'interaction_warfarin_aspirin_summary', managementKey: 'interaction_warfarin_aspirin_management' }, // Similar mechanism
        'lisinopril-potassium': { severity: 'Moderate', summaryKey: 'interaction_lisinopril_potassium_summary', managementKey: 'interaction_lisinopril_potassium_management' },
        'sildenafil-nitroglycerin': { severity: 'Major', summaryKey: 'interaction_sildenafil_nitroglycerin_summary', managementKey: 'interaction_sildenafil_nitroglycerin_management' },
        'simvastatin-clarithromycin': { severity: 'Major', summaryKey: 'interaction_simvastatin_clarithromycin_summary', managementKey: 'interaction_simvastatin_clarithromycin_management' },
        'ibuprofen-lisinopril': { severity: 'Moderate', summaryKey: 'interaction_ibuprofen_lisinopril_summary', managementKey: 'interaction_ibuprofen_lisinopril_management' },
    };

    const handleDrugChange = (index: number, value: string) => {
        const newDrugs = [...drugs];
        newDrugs[index] = value;
        setDrugs(newDrugs);
    };

    const addDrugInput = () => {
        setDrugs([...drugs, '']);
    };

    const removeDrugInput = (index: number) => {
        if (drugs.length > 2) {
            const newDrugs = drugs.filter((_, i) => i !== index);
            setDrugs(newDrugs);
        }
    };

    const handleCheckInteractions = () => {
        setLoading(true);
        setChecked(true);
        setResults(null);

        const foundInteractions: Interaction[] = [];
        const validDrugs = drugs.map(d => d.trim().toLowerCase()).filter(d => d);

        if (validDrugs.length < 2) {
            setLoading(false);
            setResults([]);
            return;
        }

        // Generate unique pairs
        for (let i = 0; i < validDrugs.length; i++) {
            for (let j = i + 1; j < validDrugs.length; j++) {
                const pair = [validDrugs[i], validDrugs[j]].sort();
                const key = pair.join('-');
                
                if (interactionDB[key]) {
                    foundInteractions.push({
                        pair: [validDrugs[i], validDrugs[j]],
                        ...interactionDB[key]
                    });
                }
            }
        }
        
        // Simulate API call
        setTimeout(() => {
            setResults(foundInteractions);
            setLoading(false);
        }, 1000);
    };

    const clearAll = () => {
        setDrugs(['', '']);
        setResults(null);
        setChecked(false);
    };
    
    const getSeverityStyles = (severity: 'Major' | 'Moderate' | 'Minor') => {
        switch (severity) {
            case 'Major': return 'border-red-500 bg-red-50 text-red-800';
            case 'Moderate': return 'border-orange-500 bg-orange-50 text-orange-800';
            case 'Minor': return 'border-yellow-400 bg-yellow-50 text-yellow-800';
            default: return 'border-gray-300 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{t('drugInteractionCheckerTitle')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md self-start">
                    <p className="text-sm text-gray-600 mb-4">{t('drugInteractionCheckerDescription')}</p>
                    <div className="space-y-3" id="drug-input-list">
                        {drugs.map((drug, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={t('drugNamePlaceholder')}
                                    value={drug}
                                    onChange={(e) => handleDrugChange(index, e.target.value)}
                                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                {drugs.length > 2 && (
                                    <button onClick={() => removeDrugInput(index)} title={t('removeDrug')} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={addDrugInput} className="mt-4 w-full text-sm text-blue-600 font-semibold p-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        {t('addDrug')}
                    </button>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <button onClick={handleCheckInteractions} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" disabled={loading}>{t('checkForInteractions')}</button>
                        <button onClick={clearAll} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">{t('clearList')}</button>
                    </div>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[20rem] flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('interactionResults')}</h2>
                        {loading && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
                                <p className="mt-3 text-gray-600">{t('checkingInteractions')}</p>
                            </div>
                        )}
                        {!loading && results && results.length > 0 && (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div key={index} className={`p-4 border-l-4 rounded-md ${getSeverityStyles(result.severity)}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold capitalize">{`${t('interactionBetween')} ${result.pair[0]} ${t('and')} ${result.pair[1]}`}</h3>
                                            <span className="text-sm font-semibold px-2 py-0.5 rounded-full border">{t(result.severity.toLowerCase())}</span>
                                        </div>
                                        <div className="mt-2 space-y-2 text-sm">
                                            <p><strong>{t('summary')}:</strong> {t(result.summaryKey)}</p>
                                            <p><strong>{t('clinicalManagement')}:</strong> {t(result.managementKey)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && checked && results && results.length === 0 && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">✓</div>
                                <h3 className="font-semibold text-lg mt-4">{t('noInteractionsFound')}</h3>
                                <p className="text-sm text-gray-500">{t('noInteractionsFoundDesc')}</p>
                            </div>
                        )}
                        {!loading && !checked && (
                             <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                                <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-3xl">💊</div>
                                <p className="text-gray-500 mt-4">{t('drugInteractionCheckerDescription')}</p>
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
        </div>
    );
};

export default DrugInteractionChecker;