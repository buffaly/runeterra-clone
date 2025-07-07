import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { SupportedLanguage } from '@/local';

interface LanguageDropdownProps {
    currentLanguage: SupportedLanguage;
    onLanguageChange: (language: SupportedLanguage) => void;
}

// Language configurations with flags and names
const LANGUAGE_CONFIG = {
    'en': { flag: '🇺🇸', name: 'English' },
    'th': { flag: '🇹🇭', name: 'ไทย' },
    'ja': { flag: '🇯🇵', name: '日本語' },
    'ko': { flag: '🇰🇷', name: '한국어' },
    'zh-cn': { flag: '🇨🇳', name: '中文(简)' },
    'zh-tw': { flag: '🇹🇼', name: '中文(繁)' },
    'fr': { flag: '🇫🇷', name: 'Français' },
    'de': { flag: '🇩🇪', name: 'Deutsch' },
    'es': { flag: '🇪🇸', name: 'Español' },
    'pt': { flag: '🇵🇹', name: 'Português' },
    'ru': { flag: '🇷🇺', name: 'Русский' }
} as const;

export function LanguageDropdown({ currentLanguage, onLanguageChange }: LanguageDropdownProps) {
    const currentFlag = LANGUAGE_CONFIG[currentLanguage].flag;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-[#010a13] border border-[#1e2328] rounded-md text-[#f0e6d2] hover:bg-[#1e2328] transition-colors duration-200 text-sm">
                    <span className="text-base">{currentFlag}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="bg-[#010a13] border-[#1e2328] text-[#f0e6d2] min-w-[200px]"
                style={{
                    backgroundColor: '#010a13',
                    borderColor: '#1e2328',
                    color: '#f0e6d2'
                }}
            >
                {Object.entries(LANGUAGE_CONFIG).map(([langCode, config]) => (
                    <DropdownMenuItem
                        key={langCode}
                        onClick={() => onLanguageChange(langCode as SupportedLanguage)}
                        inset={false}
                        className={`
                            flex items-center gap-3 px-3 py-2 cursor-pointer
                            hover:bg-[#1e2328] hover:text-[#f0e6d2]
                            ${currentLanguage === langCode ? 'bg-[#1e2328]' : ''}
                        `}
                        style={{
                            backgroundColor: currentLanguage === langCode ? '#1e2328' : 'transparent'
                        }}
                    >
                        <span className="text-base">{config.flag}</span>
                        <span className="text-sm font-medium">{config.name}</span>
                        {currentLanguage === langCode && (
                            <span className="ml-auto text-[#0595a9] text-xs">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 