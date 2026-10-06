import React from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { EvaluationResult, Language, TenderMetadata } from '../types/tender';
import { getT } from '../i18n/translations';

interface StatusBannerProps {
  tender: TenderMetadata;
  items: EvaluationResult[];
  isGenerating: boolean;
  packageBlobUrl: string | null;
  onGeneratePackage: () => void;
  onExportCsv: () => void;
  onSaveSession: () => void;
  hasSavedSession: boolean;
  lang: Language;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  tender,
  items,
  isGenerating,
  packageBlobUrl,
  onGeneratePackage,
  onExportCsv,
  onSaveSession,
  hasSavedSession,
  lang,
}) => {
  const t = getT(lang);

  const blockingItems = items.filter(i => i.isBlocking);
  const okItems = items.filter(i => i.status === 'OK');
  const notProvidedItems = items.filter(i => i.status === 'NOT_PROVIDED');

  const isReady = blockingItems.length === 0;

  return (
    <div className="bg-[#11192e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{items.length}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{t.statusFilterAll}</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{okItems.length}</div>
          <div className="text-[11px] text-emerald-300 font-medium mt-0.5">{t.statusOk}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-300">{notProvidedItems.length}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{t.statusNotProvided}</div>
        </div>

        <div className={`p-3 rounded-xl border ${
          blockingItems.length > 0 
            ? 'bg-rose-500/10 border-rose-500/30' 
            : 'bg-emerald-500/10 border-emerald-500/20'
        }`}>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${
            blockingItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {blockingItems.length}
          </div>
          <div className={`text-[11px] font-medium mt-0.5 ${
            blockingItems.length > 0 ? 'text-rose-300' : 'text-emerald-300'
          }`}>
            {blockingItems.length > 0 ? t.statusFilterBlocking : 'Zero Errors'}
          </div>
        </div>
      </div>

      {/* Validation Message Banner */}
      {!isReady ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3.5 text-rose-300 text-xs">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-rose-200">{t.blockingBannerTitle}</div>
            <div className="text-rose-300/80 leading-relaxed">
              {t.blockingBannerSubtitle}
            </div>
            <ul className="list-disc list-inside mt-2 space-y-0.5 text-[11px] text-rose-200/90 font-medium">
              {blockingItems.map(item => (
                <li key={item.requirement.id}>
                  <span className="font-semibold">
                    {lang === 'en' ? item.requirement.title_en : item.requirement.title_bn}
                  </span>
                  : {lang === 'en' ? item.reason : item.reason_bn}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3.5 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-emerald-200">{t.allValidTitle}</div>
            <div className="text-emerald-300/80 leading-relaxed mt-0.5">
              {t.allValidSubtitle}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Left Secondary tools */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={onExportCsv}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onSaveSession}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm"
          >
            {hasSavedSession ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-sky-400" />
                <span>{t.saveSession}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Primary Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {packageBlobUrl ? (
            <a
              href={packageBlobUrl}
              download={`${tender.tender_id}_Package.pdf`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadBtn}</span>
            </a>
          ) : (
            <button
              onClick={onGeneratePackage}
              disabled={!isReady || isGenerating}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg ${
                isReady && !isGenerating
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{t.generateBtn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
