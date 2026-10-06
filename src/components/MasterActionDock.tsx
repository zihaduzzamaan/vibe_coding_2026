import React from 'react';
import { 
  Sparkles, 
  Download, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Save, 
  Check, 
  Stamp as StampIcon,
  RotateCcw
} from 'lucide-react';
import { EvaluationResult, Language, StampConfig, TenderMetadata } from '../types/tender';
import { getT } from '../i18n/translations';

interface MasterActionDockProps {
  tender: TenderMetadata;
  items: EvaluationResult[];
  isGenerating: boolean;
  packageBlobUrl: string | null;
  stampConfig: StampConfig | null;
  onGeneratePackage: () => void;
  onExportCsv: () => void;
  onSaveSession: () => void;
  hasSavedSession: boolean;
  lang: Language;
  onJumpToBlockers?: () => void;
}

export const MasterActionDock: React.FC<MasterActionDockProps> = ({
  tender,
  items,
  isGenerating,
  packageBlobUrl,
  stampConfig,
  onGeneratePackage,
  onExportCsv,
  onSaveSession,
  hasSavedSession,
  lang,
  onJumpToBlockers,
}) => {
  const t = getT(lang);

  const blockingItems = items.filter(i => i.isBlocking);
  const okItems = items.filter(i => i.status === 'OK');
  const totalPages = okItems.reduce((acc, curr) => acc + (curr.matchedFile?.pageCount || 0), 0);
  const isReady = blockingItems.length === 0 && okItems.length > 0;

  return (
    <aside 
      aria-label="Master Package Action Bar"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300"
    >
      <div className="bg-[#0d1527]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/80 ring-1 ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Status Diagnostic */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Icon */}
          <div className="shrink-0">
            {isReady ? (
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Status Copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                isReady ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {isReady ? t.dockReady : `${blockingItems.length} ${t.dockBlocked}`}
              </span>

              {/* Stamp active badge */}
              {stampConfig && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <StampIcon className="w-2.5 h-2.5" />
                  {t.dockSealActive}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {isReady ? (
                <>
                  <span className="text-slate-200 font-semibold">{okItems.length}</span> / {items.length} matched •{' '}
                  <span className="text-slate-200 font-semibold font-mono">{totalPages}</span> {t.dockPages}
                </>
              ) : (
                <button
                  onClick={onJumpToBlockers}
                  className="hover:underline text-rose-300 text-left truncate flex items-center gap-1"
                  title="View blocking issue"
                >
                  <span>Resolve:</span>
                  <span className="font-semibold underline">
                    {lang === 'en' ? blockingItems[0]?.requirement.title_en : blockingItems[0]?.requirement.title_bn}
                  </span>
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Tools & Primary Action */}
        <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto shrink-0">
          
          {/* Export CSV tool */}
          <button
            onClick={onExportCsv}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5"
            title={t.exportCsv}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{t.exportCsv}</span>
          </button>

          {/* Save Session tool */}
          <button
            onClick={onSaveSession}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5"
            title={t.saveSession}
          >
            {hasSavedSession ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">{t.saveSession}</span>
              </>
            )}
          </button>

          {/* Primary Action Button */}
          {packageBlobUrl ? (
            <div className="flex items-center gap-2">
              <a
                href={packageBlobUrl}
                download={`${tender.tender_id}_Package.pdf`}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{t.dockDownloadNow}</span>
              </a>

              <button
                onClick={onGeneratePackage}
                disabled={isGenerating}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 transition-all active:scale-95"
                title={t.dockRegenerate}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={onGeneratePackage}
              disabled={!isReady || isGenerating}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isReady && !isGenerating
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/30 cursor-pointer ring-1 ring-emerald-400/40'
                  : 'bg-slate-800/90 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{t.dockGenerateNow}</span>
                </>
              )}
            </button>
          )}

        </div>

      </div>
    </aside>
  );
};
