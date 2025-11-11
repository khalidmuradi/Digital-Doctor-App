
import React, { createContext, useState, useContext, ReactNode } from 'react';
import translations from '../translations';

interface LanguageContextType {
    language: string;
    changeLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>(localStorage.getItem('selectedLanguage') || 'en');

    const changeLanguage = (lang: string) => {
        localStorage.setItem('selectedLanguage', lang);
        setLanguage(lang);
    };

    const t = (key: string): string => {
        const langDict = (translations as any)[language] || translations.en;
        return langDict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
