
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { getLanguage, setLanguage } from "./utils/translations";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = React.useState(getLanguage());
  
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fi", name: "Suomi", flag: "🇫🇮" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" }
  ];
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // No need to set local state, as we are about to reload the page
    window.location.reload();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-amber-300 hover:bg-amber-700 hover:text-white flex items-center gap-1.5"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">
            {languages.find(l => l.code === currentLang).flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-amber-50 border-amber-200">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`gap-2 ${currentLang === lang.code ? 'font-bold bg-amber-100' : ''} hover:bg-amber-100 text-amber-900`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
