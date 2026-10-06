import React, { useRef } from 'react';
import { Stamp, Upload, X, ShieldCheck, Sliders, Check } from 'lucide-react';
import { Language, StampConfig } from '../types/tender';
import { getT } from '../i18n/translations';

interface StampPanelProps {
  lang: Language;
  stampConfig: StampConfig | null;
  onStampChange: (config: StampConfig | null) => void;
}

export const StampPanel: React.FC<StampPanelProps> = ({
  lang,
  stampConfig,
  onStampChange,
}) => {
  const t = getT(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/') && !file.name.match(/\.(png|jpe?g)$/i)) {
      alert('Please upload an image file (PNG or JPG) for the seal/stamp.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onStampChange({
      file,
      previewUrl,
      position: stampConfig?.position || 'bottom-right',
      targetPages: stampConfig?.targetPages || 'all-documents',
      opacity: stampConfig?.opacity ?? 0.85,
      width: stampConfig?.width ?? 70,
    });
  };

  const handleUpdate = (partial: Partial<StampConfig>) => {
    if (!stampConfig) return;
    onStampChange({ ...stampConfig, ...partial });
  };

  const handleRemove = () => {
    if (stampConfig?.previewUrl) {
      URL.revokeObjectURL(stampConfig.previewUrl);
    }
    onStampChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to load bundled company_logo.png
  const handleLoadSampleLogo = async () => {
    try {
      // In Vite public / Problems directory
      const res = await fetch('/Problems/problem-pack/sample-pack/documents/company_logo.png');
      if (!res.ok) {
        throw new Error('Sample logo not found via public path');
      }
      const blob = await res.blob();
      const file = new File([blob], 'company_logo.png', { type: 'image/png' });
      const previewUrl = URL.createObjectURL(file);
      onStampChange({
        file,
        previewUrl,
        position: 'bottom-right',
        targetPages: 'all-documents',
        opacity: 0.85,
        width: 70,
      });
    } catch {
      // Fallback: trigger file picker
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Stamp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">{t.stampTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Section 7 Bonus
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Apply official digital seal / watermark onto generated package documents
            </p>
          </div>
        </div>

        {stampConfig && (
          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t.removeStamp}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {!stampConfig ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-indigo-950/20 text-slate-300 hover:text-white flex items-center justify-center gap-2.5 text-sm font-medium transition-all group"
          >
            <Upload className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            {t.stampUpload}
          </button>

          <button
            onClick={handleLoadSampleLogo}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-medium transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {t.sampleLogo}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Preview Box */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="relative w-28 h-36 bg-white rounded shadow-md overflow-hidden flex flex-col justify-between p-2">
              <div className="text-[6px] text-slate-400 leading-tight select-none">
                <div className="h-1 w-12 bg-slate-300 mb-1 rounded-full"></div>
                <div className="h-0.5 w-full bg-slate-200 mb-0.5 rounded-full"></div>
                <div className="h-0.5 w-20 bg-slate-200 mb-0.5 rounded-full"></div>
                <div className="h-0.5 w-16 bg-slate-200 rounded-full"></div>
              </div>

              {/* Simulated Stamp Placement */}
              <div
                className={`absolute p-0.5 transition-all ${
                  stampConfig.position === 'bottom-right' ? 'bottom-2 right-2' :
                  stampConfig.position === 'bottom-left' ? 'bottom-2 left-2' :
                  stampConfig.position === 'top-right' ? 'top-2 right-2' :
                  'bottom-2 left-1/2 -translate-x-1/2'
                }`}
                style={{ opacity: stampConfig.opacity }}
              >
                <img
                  src={stampConfig.previewUrl}
                  alt="Seal Preview"
                  className="w-7 h-7 object-contain rounded"
                />
              </div>

              <div className="h-0.5 w-full bg-slate-300 rounded-full"></div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 truncate max-w-full">
              {stampConfig.file.name}
            </span>
          </div>

          {/* Controls */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Position */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                {t.stampPosition}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'bottom-right', label: t.posBottomRight },
                  { id: 'bottom-left', label: t.posBottomLeft },
                  { id: 'top-right', label: t.posTopRight },
                  { id: 'bottom-center', label: t.posBottomCenter },
                ].map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => handleUpdate({ position: pos.id as any })}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                      stampConfig.position === pos.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Pages */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                {t.stampTargetPages}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all-documents', label: t.pagesAllDocs },
                  { id: 'all-pages', label: t.pagesAll },
                  { id: 'last-page', label: t.pagesLast },
                  { id: 'cover-only', label: t.pagesCover },
                ].map(target => (
                  <button
                    key={target.id}
                    onClick={() => handleUpdate({ targetPages: target.id as any })}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                      stampConfig.targetPages === target.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{t.stampOpacity}</span>
                <span className="text-indigo-400 font-mono">{Math.round(stampConfig.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={stampConfig.opacity}
                onChange={e => handleUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{t.stampSize}</span>
                <span className="text-indigo-400 font-mono">{stampConfig.width}pt</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={stampConfig.width}
                onChange={e => handleUpdate({ width: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
