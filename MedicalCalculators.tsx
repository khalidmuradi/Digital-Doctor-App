import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

type CalculatorId = 'bmi' | 'bmr' | 'ibw' | 'creatinine';

const calculators: { id: CalculatorId; nameKey: string; descKey: string; icon: string; }[] = [
    { id: 'bmi', nameKey: 'bmiCalculator', descKey: 'bmiCalculatorDesc', icon: '📏' },
    { id: 'bmr', nameKey: 'bmrCalculator', descKey: 'bmrCalculatorDesc', icon: '🔥' },
    { id: 'ibw', nameKey: 'ibwCalculator', descKey: 'ibwCalculatorDesc', icon: '⚖️' },
    { id: 'creatinine', nameKey: 'creatinineClearanceCalculator', descKey: 'creatinineClearanceCalculatorDesc', icon: '💧' },
];

const MedicalCalculators: React.FC = () => {
    const { t } = useTranslation();
    const [selectedCalculator, setSelectedCalculator] = useState<CalculatorId | null>(null);

    const renderCalculator = () => {
        switch (selectedCalculator) {
            case 'bmi': return <BMICalculator />;
            case 'bmr': return <BMRCalculator />;
            case 'ibw': return <IBWCalculator />;
            case 'creatinine': return <CreatinineClearanceCalculator />;
            default:
                return (
                    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                        <div className="text-5xl mb-4">🧮</div>
                        <h2 className="text-xl font-semibold text-gray-700">{t('selectCalculator')}</h2>
                        <p className="text-gray-500 mt-2 max-w-sm">{t('calculatorDescription')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{t('medicalCalculators')}</h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
                        {calculators.map(calc => (
                            <button
                                key={calc.id}
                                onClick={() => setSelectedCalculator(calc.id)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedCalculator === calc.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                            >
                                <span className="text-2xl">{calc.icon}</span>
                                <div>
                                    <p className="font-semibold">{t(calc.nameKey)}</p>
                                    <p className="text-xs opacity-80">{t(calc.descKey)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[20rem]">
                        {renderCalculator()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Individual Calculator Components ---

const BMICalculator: React.FC = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState({ weight: '', height: '' });
    const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

    const handleCalculate = () => {
        const weight = parseFloat(inputs.weight);
        const height = parseFloat(inputs.height);
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            let category = '';
            if (bmi < 18.5) category = t('underweight');
            else if (bmi < 25) category = t('normalWeight');
            else if (bmi < 30) category = t('overweight');
            else category = t('obesity');
            setResult({ bmi, category });
        }
    };

    const handleClear = () => {
        setInputs({ weight: '', height: '' });
        setResult(null);
    };

    return (
        <CalculatorLayout
            title={t('bmiCalculator')}
            onCalculate={handleCalculate}
            onClear={handleClear}
            result={
                result && (
                    <div className="text-center">
                        <p className="text-gray-600">{t('yourBmiIs')}</p>
                        <p className="text-4xl font-bold text-blue-600 my-2">{result.bmi.toFixed(1)}</p>
                        <p className="font-semibold"><span className="text-gray-600">{t('bmiCategory')}:</span> {result.category}</p>
                    </div>
                )
            }
        >
            <InputField label={`${t('weight')} (${t('kg')})`} type="number" value={inputs.weight} onChange={e => setInputs(i => ({...i, weight: e.target.value}))} />
            <InputField label={`${t('height')} (${t('cm')})`} type="number" value={inputs.height} onChange={e => setInputs(i => ({...i, height: e.target.value}))} />
        </CalculatorLayout>
    );
};

const BMRCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState({ weight: '', height: '', age: '', gender: 'male' });
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const weight = parseFloat(inputs.weight);
        const height = parseFloat(inputs.height);
        const age = parseInt(inputs.age, 10);
        if (weight > 0 && height > 0 && age > 0) {
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr += (inputs.gender === 'male' ? 5 : -161);
            setResult(bmr);
        }
    };
    
    const handleClear = () => {
        setInputs({ weight: '', height: '', age: '', gender: 'male' });
        setResult(null);
    };

    return (
        <CalculatorLayout
            title={t('bmrCalculator')}
            onCalculate={handleCalculate}
            onClear={handleClear}
            result={
                result && (
                     <div className="text-center">
                        <p className="text-gray-600">{t('yourBmrIs')}</p>
                        <p className="text-4xl font-bold text-blue-600 my-2">{result.toFixed(0)}</p>
                        <p className="text-gray-600">{t('caloriesPerDay')}</p>
                    </div>
                )
            }
        >
            <InputField label={`${t('weight')} (${t('kg')})`} type="number" value={inputs.weight} onChange={e => setInputs(i => ({...i, weight: e.target.value}))} />
            <InputField label={`${t('height')} (${t('cm')})`} type="number" value={inputs.height} onChange={e => setInputs(i => ({...i, height: e.target.value}))} />
            <InputField label={`${t('age')} (${t('years')})`} type="number" value={inputs.age} onChange={e => setInputs(i => ({...i, age: e.target.value}))} />
            <SelectField label={t('gender')} value={inputs.gender} onChange={e => setInputs(i => ({...i, gender: e.target.value}))}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
            </SelectField>
        </CalculatorLayout>
    );
};

const IBWCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState({ height: '', gender: 'male' });
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const height = parseFloat(inputs.height);
        if (height > 152.4) { // Height must be over 5 feet (152.4 cm)
            const heightInInches = height / 2.54;
            const inchesOver5Feet = heightInInches - 60;
            let ibw = (inputs.gender === 'male' ? 50 : 45.5) + (2.3 * inchesOver5Feet);
            setResult(ibw);
        } else {
            setResult(null); // Or show an error
        }
    };

    const handleClear = () => {
        setInputs({ height: '', gender: 'male' });
        setResult(null);
    };

    return (
        <CalculatorLayout
            title={t('ibwCalculator')}
            onCalculate={handleCalculate}
            onClear={handleClear}
            result={
                result && (
                     <div className="text-center">
                        <p className="text-gray-600">{t('yourIbwIs')}</p>
                        <p className="text-4xl font-bold text-blue-600 my-2">{result.toFixed(1)} <span className="text-2xl">{t('kg')}</span></p>
                    </div>
                )
            }
        >
            <InputField label={`${t('height')} (${t('cm')})`} type="number" value={inputs.height} onChange={e => setInputs(i => ({...i, height: e.target.value}))} />
            <SelectField label={t('gender')} value={inputs.gender} onChange={e => setInputs(i => ({...i, gender: e.target.value}))}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
            </SelectField>
        </CalculatorLayout>
    );
};

const CreatinineClearanceCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState({ age: '', weight: '', creatinine: '', gender: 'male' });
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const age = parseInt(inputs.age, 10);
        const weight = parseFloat(inputs.weight);
        const creatinine = parseFloat(inputs.creatinine);
        if (age > 0 && weight > 0 && creatinine > 0) {
            let clearance = ((140 - age) * weight) / (72 * creatinine);
            if (inputs.gender === 'female') {
                clearance *= 0.85;
            }
            setResult(clearance);
        }
    };

    const handleClear = () => {
        setInputs({ age: '', weight: '', creatinine: '', gender: 'male' });
        setResult(null);
    };

    return (
        <CalculatorLayout
            title={t('creatinineClearanceCalculator')}
            onCalculate={handleCalculate}
            onClear={handleClear}
            result={
                result && (
                    <div className="text-center">
                        <p className="text-gray-600">{t('yourCreatinineClearanceIs')}</p>
                        <p className="text-4xl font-bold text-blue-600 my-2">{result.toFixed(1)}</p>
                        <p className="text-gray-600">{t('ml_min')}</p>
                    </div>
                )
            }
        >
            <InputField label={`${t('age')} (${t('years')})`} type="number" value={inputs.age} onChange={e => setInputs(i => ({...i, age: e.target.value}))} />
            <InputField label={`${t('weight')} (${t('kg')})`} type="number" value={inputs.weight} onChange={e => setInputs(i => ({...i, weight: e.target.value}))} />
            <InputField label={`${t('serumCreatinine')} (${t('mg_dl')})`} type="number" value={inputs.creatinine} onChange={e => setInputs(i => ({...i, creatinine: e.target.value}))} />
            <SelectField label={t('gender')} value={inputs.gender} onChange={e => setInputs(i => ({...i, gender: e.target.value}))}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
            </SelectField>
        </CalculatorLayout>
    );
};

// --- Reusable Layout & Form Components ---

const CalculatorLayout: React.FC<{
    title: string;
    children: React.ReactNode;
    onCalculate: () => void;
    onClear: () => void;
    result: React.ReactNode;
}> = ({ title, children, onCalculate, onClear, result }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {children}
            </div>
            <div className="flex-grow"></div> {/* Spacer */}
            {result && (
                <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-center text-blue-800 mb-2">{t('result')}</h4>
                    {result}
                </div>
            )}
            <div className="mt-auto pt-6 flex justify-end gap-4">
                <button onClick={onClear} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">{t('clear')}</button>
                <button onClick={onCalculate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{t('calculate')}</button>
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

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);


export default MedicalCalculators;