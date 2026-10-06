import React, { useRef } from 'react';
import { 
  Stamp, 
  Upload, 
  X, 
  ShieldCheck, 
  Sliders, 
  Move, 
  Layers, 
  Check, 
  Eye, 
  Maximize2 
} from 'lucide-react';
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
      fileInputRef.current?.click();
    }
  };

  const opacityPresets = [0.5, 0.75, 0.85, 1.0];
  const sizePresets = [50, 70, 90, 110];

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl transition-all">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <Stamp className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">{t.stampTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Section 7 Bonus
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.stampSubtitle}
            </p>
          </div>
        </div>

        {stampConfig && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Image</span>
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.removeStamp}</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Empty State */}
      {!stampConfig ? (
        <div className="mt-5 p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              {t.stampUpload}
            </p>
            <p className="text-xs text-slate-400">
              Upload transparent PNG or company emblem to watermark package documents automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Seal File</span>
              </button>
              <button
                onClick={handleLoadSampleLogo}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.sampleLogo}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Configured State */
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column 1: Live Interactive Mockup (3 cols) */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 flex flex-col justify-between items-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/60 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Preview
              </span>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live
              </span>
            </div>

            {/* Document Sheet Visual Mockup */}
            <div className="my-4 relative w-32 h-44 bg-slate-100 rounded-lg shadow-2xl overflow-hidden flex flex-col justify-between p-2.5 border border-slate-300/40 select-none">
              {/* Document Header lines */}
              <div className="space-y-1">
                <div className="h-1.5 w-12 bg-slate-400/80 rounded-full"></div>
                <div className="h-1 w-full bg-slate-300 rounded-full"></div>
                <div className="h-1 w-20 bg-slate-300 rounded-full"></div>
              </div>

              {/* Document Body lines */}
              <div className="space-y-1 my-auto opacity-70">
                <div className="h-1 w-full bg-slate-300 rounded-full"></div>
                <div className="h-1 w-24 bg-slate-300 rounded-full"></div>
                <div className="h-1 w-16 bg-slate-300 rounded-full"></div>
                <div className="h-1 w-full bg-slate-300 rounded-full"></div>
              </div>

              {/* Live Positioned Seal Image */}
              <div
                className={`absolute transition-all duration-200 pointer-events-none flex items-center justify-center ${
                  stampConfig.position === 'bottom-right' ? 'bottom-2.5 right-2.5' :
                  stampConfig.position === 'bottom-left' ? 'bottom-2.5 left-2.5' :
                  stampConfig.position === 'top-right' ? 'top-2.5 right-2.5' :
                  'bottom-2.5 left-1/2 -translate-x-1/2'
                }`}
                style={{ 
                  opacity: stampConfig.opacity,
                  width: `${Math.max(22, Math.min(46, stampConfig.width * 0.35))}px`,
                  height: `${Math.max(22, Math.min(46, stampConfig.width * 0.35))}px`,
                }}
              >
                <img
                  src={stampConfig.previewUrl}
                  alt="Seal Preview"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              {/* Document Footer */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <div className="h-0.5 w-8 bg-slate-300 rounded-full"></div>
                <div className="h-0.5 w-4 bg-slate-400 rounded-full"></div>
              </div>
            </div>

            {/* Seal Info Badge */}
            <div className="w-full text-center">
              <p className="text-[11px] font-medium text-slate-300 truncate" title={stampConfig.file.name}>
                {stampConfig.file.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                <span>{stampConfig.width}pt</span>
                <span>•</span>
                <span>{Math.round(stampConfig.opacity * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Section 1: Placement & Scope (Position and Apply To) - 5 cols */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-slate-950/40 p-4.5 flex flex-col justify-between space-y-4 shadow-sm">
            
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/70">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Move className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  {t.stampPlacementGroup}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t.stampPlacementDesc}
                </p>
              </div>
            </div>

            {/* Sub-block A: Position Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>{t.stampPosition}</span>
                <span className="text-[10px] text-indigo-400 font-medium font-mono">
                  {stampConfig.position}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-right', label: t.posBottomRight, hint: '↘' },
                  { id: 'bottom-left', label: t.posBottomLeft, hint: '↙' },
                  { id: 'top-right', label: t.posTopRight, hint: '↗' },
                  { id: 'bottom-center', label: t.posBottomCenter, hint: '↓' },
                ].map(pos => {
                  const isActive = stampConfig.position === pos.id;
                  return (
                    <button
                      key={pos.id}
                      onClick={() => handleUpdate({ position: pos.id as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all flex items-center justify-between active:scale-98 ${
                        isActive
                          ? 'bg-indigo-600/20 border-indigo-500/90 text-indigo-200 ring-1 ring-indigo-500/30 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{pos.label}</span>
                      <span className={`text-[11px] font-mono ${isActive ? 'text-indigo-300 font-bold' : 'text-slate-500'}`}>
                        {pos.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimal Sub-divider */}
            <div className="border-t border-slate-800/60 my-1" />

            {/* Sub-block B: Apply To (Target Pages) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>{t.stampTargetPages}</span>
                <span className="text-[10px] text-emerald-400 font-medium font-mono">
                  {stampConfig.targetPages}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all-documents', label: t.pagesAllDocs },
                  { id: 'all-pages', label: t.pagesAll },
                  { id: 'last-page', label: t.pagesLast },
                  { id: 'cover-only', label: t.pagesCover },
                ].map(target => {
                  const isActive = stampConfig.targetPages === target.id;
                  return (
                    <button
                      key={target.id}
                      onClick={() => handleUpdate({ targetPages: target.id as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all flex items-center justify-between active:scale-98 ${
                        isActive
                          ? 'bg-emerald-600/20 border-emerald-500/90 text-emerald-200 ring-1 ring-emerald-500/30 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{target.label}</span>
                      {isActive && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 2: Appearance & Dimensions (Opacity and Size) - 4 cols */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800/90 bg-slate-950/40 p-4.5 flex flex-col justify-between space-y-4 shadow-sm">
            
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/70">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  {t.stampAppearanceGroup}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t.stampAppearanceDesc}
                </p>
              </div>
            </div>

            {/* Sub-block A: Opacity Slider & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300">{t.stampOpacity}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold">
                  {Math.round(stampConfig.opacity * 100)}%
                </span>
              </div>

              {/* Slider Track */}
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.05"
                value={stampConfig.opacity}
                onChange={e => handleUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Quick Presets */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {opacityPresets.map(val => (
                  <button
                    key={val}
                    onClick={() => handleUpdate({ opacity: val })}
                    className={`flex-1 py-1 text-[10px] font-mono rounded border transition-all ${
                      Math.abs(stampConfig.opacity - val) < 0.02
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {Math.round(val * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Minimal Sub-divider */}
            <div className="border-t border-slate-800/60 my-1" />

            {/* Sub-block B: Size Slider & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300">{t.stampSize}</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-[11px] font-semibold">
                  {stampConfig.width} pt
                </span>
              </div>

              {/* Slider Track */}
              <input
                type="range"
                min="40"
                max="130"
                step="5"
                value={stampConfig.width}
                onChange={e => handleUpdate({ width: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />

              {/* Quick Presets */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {sizePresets.map(val => (
                  <button
                    key={val}
                    onClick={() => handleUpdate({ width: val })}
                    className={`flex-1 py-1 text-[10px] font-mono rounded border transition-all ${
                      stampConfig.width === val
                        ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {val}pt
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </section>
  );
};
