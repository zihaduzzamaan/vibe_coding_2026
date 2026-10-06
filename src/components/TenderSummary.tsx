import React from 'react';
import { Calendar, Building, User, Tag, ShieldCheck } from 'lucide-react';
import { TenderMetadata, Language } from '../types/tender';
import { getT } from '../i18n/translations';

interface TenderSummaryProps {
  tender: TenderMetadata;
  lang: Language;
}

export const TenderSummary: React.FC<TenderSummaryProps> = ({ tender, lang }) => {
  const t = getT(lang);

  return (
    <div className="bg-[#11192e] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="uppercase tracking-wider">{t.tenderOverview}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {tender.title}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            {tender.tender_id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Procuring Entity */}
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <Building className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t.procuringEntity}</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">{tender.procuring_entity}</div>
          </div>
        </div>

        {/* Bidder */}
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <User className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t.bidder}</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">{tender.bidder}</div>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <Calendar className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-slate-400 font-medium">{t.deadline}</div>
            <div className="text-sm font-semibold font-mono text-amber-300 mt-0.5 flex items-center space-x-1.5">
              <span>{tender.submission_deadline}</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Deadline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
