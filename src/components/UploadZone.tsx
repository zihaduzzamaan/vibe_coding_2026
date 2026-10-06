import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, AlertTriangle, AlertCircle, Eye, Copy, CheckCircle2 } from 'lucide-react';
import { UploadedFile, Language } from '../types/tender';
import { getT } from '../i18n/translations';

interface UploadZoneProps {
  files: UploadedFile[];
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (fileId: string) => void;
  onPreviewFile: (file: UploadedFile) => void;
  nonPdfErrors: string[];
  onDismissNonPdfError: (index: number) => void;
  lang: Language;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  files,
  onFilesSelected,
  onRemoveFile,
  onPreviewFile,
  nonPdfErrors,
  onDismissNonPdfError,
  lang,
}) => {
  const t = getT(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Non-PDF Rejection Banner (Rule 4.2) */}
      {nonPdfErrors.length > 0 && (
        <div className="space-y-2">
          {nonPdfErrors.map((err, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between text-rose-300 text-sm shadow-md animate-in fade-in"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-200">{t.nonPdfError} {err}</div>
                  <div className="text-xs text-rose-300/80 mt-0.5">{t.nonPdfHint}</div>
                </div>
              </div>
              <button
                onClick={() => onDismissNonPdfError(idx)}
                className="text-xs text-rose-400 hover:text-rose-200 px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
              >
                {t.close}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.005]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files) onFilesSelected(e.target.files);
          }}
          className="hidden"
        />

        <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {t.uploadTitle}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t.uploadSubtitle}
        </p>

        <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">PDF only</span>
          <span>•</span>
          <span>Max 30 files</span>
          <span>•</span>
          <span>Max 50 MB total</span>
        </div>
      </div>

      {/* Uploaded Files Grid / List */}
      {files.length > 0 && (
        <div className="bg-[#11192e] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">{t.uploadedFiles}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {files.length}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Total: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  file.isDuplicate
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden pr-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    file.isDuplicate ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-emerald-400 font-medium">
                        {file.pageCount} {t.pageCount.toLowerCase()}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>

                    {/* Duplicate Indicator (Rule 4.6) */}
                    {file.isDuplicate && (
                      <div className="mt-1 flex items-center space-x-1 text-[10px] text-amber-300 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">
                          {t.duplicateBadge}: {file.duplicateOfName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => onPreviewFile(file)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title={t.previewFile}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title={t.removeFile}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
