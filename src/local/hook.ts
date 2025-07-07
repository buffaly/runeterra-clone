import { useEffect, useState } from "react";
import { SupportedLanguage, TRANSLATIONS } from ".";

export function useLanguage() {
    const [language, setLanguage] = useState<SupportedLanguage | 'en'>('en');

    // random language at start
    useEffect(() => {
        const languages = Object.keys(TRANSLATIONS) as SupportedLanguage[];
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
        setLanguage(randomLanguage);
    }, []);

    return { language, setLanguage };
}