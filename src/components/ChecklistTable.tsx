import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  MinusCircle, 
  FileText, 
  X, 
  Eye, 
  Sparkles,
  Calendar,
  Lock,
  Wand2
} from 'lucide-react';
import { EvaluationResult, UploadedFile, Language, DocumentStatus } from '../types/tender';
import { getT } from '../i18n/translations';

interface ChecklistTableProps {
  items: EvaluationResult[];
  availableFiles: UploadedFile[];
  onMatchFile: (requirementId: string, fileId: string) => void;
  onUnmatchFile: (requirementId: string) => void;
  onUpdateExpiryDate: (requirementId: string, date: string) => void;
  onPreviewFile: (file: UploadedFile) => void;
  onAutoMatch: () => void;
  lang: Language;
}

export const ChecklistTable: React.FC<ChecklistTableProps> = ({
  items,
  availableFiles,
  onMatchFile,
  onUnmatchFile,
  onUpdateExpiryDate,
  onPreviewFile,
  onAutoMatch,
  lang,
}) => {
  const t = getT(lang);

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.statusOk}</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.statusExpired}</span>
          </span>
        );
      case 'EXPIRY_DATE_NEEDED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.statusExpiryNeeded}</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.statusMissing}</span>
          </span>
        );
      case 'NOT_PROVIDED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>{t.statusNotProvided}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#11192e] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>{lang === 'en' ? 'Tender Document Checklist' : 'দরপত্র নথিপত্রের চেকলিস্ট'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {items.length} items
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'en'
              ? 'Matched documents will be concatenated strictly by order (1 to 10).'
              : 'সংযুক্ত নথিগুলো ক্রমানুসারে (১ থেকে ১০) বিন্যস্ত করা হবে।'}
          </p>
        </div>

        {/* Auto Match Button */}
        <button
          onClick={onAutoMatch}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5 active:scale-95 shrink-0"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{t.autoMatchBtn}</span>
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold font-mono">
            <tr>
              <th className="py-3 px-4 w-12 text-center">{t.order}</th>
              <th className="py-3 px-4 min-w-[200px]">{t.documentTitle}</th>
              <th className="py-3 px-4 min-w-[220px]">{t.matchedFile}</th>
              <th className="py-3 px-4 min-w-[140px]">{t.expiryDate}</th>
              <th className="py-3 px-4 min-w-[150px]">{t.status}</th>
              <th className="py-3 px-4 text-right w-20">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((row) => {
              const { requirement, matchedFile, expiryDate, status, isBlocking, reason, reason_bn } = row;
              const title = lang === 'en' ? requirement.title_en : requirement.title_bn;
              const reasonText = lang === 'en' ? reason : reason_bn;

              return (
                <tr
                  key={requirement.id}
                  className={`transition-colors ${
                    isBlocking
                      ? 'bg-rose-500/[0.02] hover:bg-rose-500/[0.05]'
                      : status === 'OK'
                      ? 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]'
                      : 'hover:bg-slate-900/40'
                  }`}
                >
                  {/* Order Column */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                    <span className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700/60 inline-flex items-center justify-center text-slate-300">
                      {requirement.order}
                    </span>
                  </td>

                  {/* Document Title & Tags */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-sm">
                      {title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {requirement.mandatory ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {t.mandatory}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {t.optional}
                        </span>
                      )}

                      {requirement.has_expiry && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Expiry Tracked</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Matched File Dropdown or Card */}
                  <td className="py-3.5 px-4">
                    {matchedFile ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700/80 max-w-xs">
                        <div className="flex items-center space-x-2 overflow-hidden pr-2">
                          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="truncate font-medium text-slate-200" title={matchedFile.name}>
                            {matchedFile.name}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {matchedFile.pageCount}p
                          </span>
                          <button
                            onClick={() => onUnmatchFile(requirement.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                            title={t.unmatch}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              onMatchFile(requirement.id, e.target.value);
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:border-slate-600 transition-colors cursor-pointer"
                        >
                          <option value="">{t.selectFileToMatch}</option>
                          {availableFiles.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.pageCount} pages) {f.isDuplicate ? `[Duplicate]` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>

                  {/* Expiry Date Column */}
                  <td className="py-3.5 px-4">
                    {requirement.has_expiry ? (
                      matchedFile ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="date"
                            value={expiryDate || ''}
                            onChange={(e) => onUpdateExpiryDate(requirement.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          {matchedFile.detectedExpiryDate && matchedFile.detectedExpiryDate !== expiryDate && (
                            <button
                              onClick={() => onUpdateExpiryDate(requirement.id, matchedFile.detectedExpiryDate!)}
                              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center space-x-1"
                              title={`Auto-detected from PDF: ${matchedFile.detectedExpiryDate}`}
                            >
                              <Sparkles className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">— Match file first —</span>
                      )
                    ) : (
                      <span className="text-slate-600 font-mono text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="py-3.5 px-4">
                    <div>{getStatusBadge(status)}</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title={reasonText}>
                      {reasonText}
                    </div>
                  </td>

                  {/* Action Column */}
                  <td className="py-3.5 px-4 text-right">
                    {matchedFile && (
                      <button
                        onClick={() => onPreviewFile(matchedFile)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title={t.previewFile}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
