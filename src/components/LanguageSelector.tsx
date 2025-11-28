import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export type Language = 'es' | 'en' | 'zh';

interface LanguageSelectorProps {
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
}

const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
    const current = languages.find(l => l.code === currentLanguage);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Cambiar idioma</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className="flex items-center justify-between gap-2 cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                        </span>
                        {currentLanguage === lang.code && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
