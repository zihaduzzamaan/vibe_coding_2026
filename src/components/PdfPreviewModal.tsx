import React from 'react';
import { X, FileText, Calendar, HardDrive, FileCheck2 } from 'lucide-react';
import { UploadedFile, Language } from '../types/tender';
import { getT } from '../i18n/translations';

interface PdfPreviewModalProps {
  file: UploadedFile | null;
  onClose: () => void;
  lang: Language;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ file, onClose, lang }) => {
  if (!file) return null;
  const t = getT(lang);

  const fileUrl = URL.createObjectURL(file.file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3 overflow-hidden pr-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-sm truncate" title={file.name}>
                {file.name}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-emerald-400">{file.pageCount} {t.pageCount.toLowerCase()}</span>
                <span>•</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                {file.detectedExpiryDate && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400">Detected Expiry: {file.detectedExpiryDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              URL.revokeObjectURL(fileUrl);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Embedded Viewer */}
        <div className="flex-1 bg-slate-950 p-2">
          <iframe
            src={fileUrl}
            title={file.name}
            className="w-full h-full rounded-xl border border-slate-800"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-center justify-between">
          <div className="font-mono text-[11px] truncate max-w-md">
            SHA-256: {file.hash}
          </div>
          <button
            onClick={() => {
              URL.revokeObjectURL(fileUrl);
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
