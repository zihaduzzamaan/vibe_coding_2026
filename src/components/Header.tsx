import React from 'react';
import { FileText, Languages, RefreshCw, Upload, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { Language, TenderMetadata } from '../types/tender';
import { getT } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  tender: TenderMetadata | null;
  onLoadSample: () => void;
  onReset: () => void;
  onUploadRequirementsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  tender,
  onLoadSample,
  onReset,
  onUploadRequirementsClick,
}) => {
  const t = getT(lang);

  return (
    <header className="border-b border-slate-800 bg-[#0d1424]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                {t.appTitle}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI DevFest
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Load Sample */}
          <button
            onClick={onLoadSample}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
            title="Load sample tender requirements"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.loadSample}</span>
          </button>

          {/* Upload Custom JSON */}
          <button
            onClick={onUploadRequirementsClick}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all flex items-center space-x-1.5 active:scale-95 hidden md:flex"
            title="Upload requirements.json"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.uploadRequirements}</span>
          </button>

          {/* Reset All */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-all active:scale-95"
            title={t.resetAll}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
