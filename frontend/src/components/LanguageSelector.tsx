'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { LanguageMetaItem } from '@/lib/types';

export const CANONICAL_LANGUAGES: LanguageMetaItem[] = [
  { code: 'en', name: 'English', native_name: 'English', script: 'Latin', locale: 'en-IN', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', native_name: 'हिंदी', script: 'Devanagari', locale: 'hi-IN', direction: 'ltr' },
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', script: 'Tamil', locale: 'ta-IN', direction: 'ltr' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', script: 'Telugu', locale: 'te-IN', direction: 'ltr' },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', script: 'Kannada', locale: 'kn-IN', direction: 'ltr' },
  { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', script: 'Malayalam', locale: 'ml-IN', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', native_name: 'मराठी', script: 'Devanagari', locale: 'mr-IN', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', native_name: 'বাংলা', script: 'Bengali', locale: 'bn-IN', direction: 'ltr' },
  { code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી', script: 'Gujarati', locale: 'gu-IN', direction: 'ltr' },
  { code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', locale: 'pa-IN', direction: 'ltr' },
  { code: 'or', name: 'Odia', native_name: 'ଓଡ଼ିଆ', script: 'Odia', locale: 'or-IN', direction: 'ltr' },
  { code: 'ur', name: 'Urdu', native_name: 'اردو', script: 'Arabic-Nastaliq', locale: 'ur-IN', direction: 'rtl' },
];

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (langCode: string, langMeta: LanguageMetaItem) => void;
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
  variant = 'compact',
  className = '',
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(currentLanguage);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pathfinder_lang');
    if (saved && CANONICAL_LANGUAGES.some((l) => l.code === saved)) {
      setSelectedLang(saved);
      applyLanguageDirection(saved);
    } else if (currentLanguage) {
      setSelectedLang(currentLanguage);
      applyLanguageDirection(currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyLanguageDirection = (code: string) => {
    const found = CANONICAL_LANGUAGES.find((l) => l.code === code) || CANONICAL_LANGUAGES[0];
    if (typeof document !== 'undefined') {
      document.documentElement.dir = found.direction;
      document.documentElement.lang = found.code;
    }
  };

  const handleSelect = async (code: string) => {
    const meta = CANONICAL_LANGUAGES.find((l) => l.code === code) || CANONICAL_LANGUAGES[0];
    setSelectedLang(code);
    setIsOpen(false);
    applyLanguageDirection(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pathfinder_lang', code);
    }

    if (onLanguageChange) {
      onLanguageChange(code, meta);
    }

    try {
      await api.setLanguagePreference(code);
    } catch {
      // Gracefully ignore if anonymous or offline
    }
  };

  const activeMeta = CANONICAL_LANGUAGES.find((l) => l.code === selectedLang) || CANONICAL_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Current language: ${activeMeta.native_name}. Click to choose language.`}
          className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
        >
          <Globe className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{activeMeta.native_name}</span>
          <span className="text-slate-400 text-xs hidden md:inline">({activeMeta.name})</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="absolute right-0 z-50 mt-1.5 w-64 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
            Explore Careers in Your Language
          </div>
          <div className="space-y-0.5">
            {CANONICAL_LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLang;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg text-left transition ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                  dir={lang.direction}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.native_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {lang.name} • {lang.script} {lang.direction === 'rtl' ? '(RTL)' : ''}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
