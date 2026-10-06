import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { TenderSummary } from './components/TenderSummary';
import { UploadZone } from './components/UploadZone';
import { ChecklistTable } from './components/ChecklistTable';
import { StatusBanner } from './components/StatusBanner';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { StampPanel } from './components/StampPanel';
import { MasterActionDock } from './components/MasterActionDock';
import MovingGrid from './components/ui/hyper-grid';
import { FileText, Stamp, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import { getT } from './i18n/translations';
import { SAMPLE_REQUIREMENTS } from './data/defaultRequirements';
import {
  RequirementsData,
  UploadedFile,
  Language,
  EvaluationResult,
  TenderMetadata,
  Requirement,
  StampConfig
} from './types/tender';
import { computeFileHash } from './utils/hashing';
import { inspectPdf } from './utils/pdfInspector';
import { evaluateRequirementStatus } from './utils/statusEngine';
import { buildMasterPdfPackage } from './utils/pdfBuilder';
import { exportChecklistCsv } from './utils/exportChecklist';
import { saveMatchesToStorage, loadMatchesFromStorage, clearMatchesFromStorage } from './utils/storage';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'checklist' | 'seal' | 'review'>('checklist');
  const [tenderData, setTenderData] = useState<RequirementsData>(SAMPLE_REQUIREMENTS);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<Record<string, { fileId?: string; expiryDate?: string }>>({});
  const [nonPdfErrors, setNonPdfErrors] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [packageBlobUrl, setPackageBlobUrl] = useState<string | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [stampConfig, setStampConfig] = useState<StampConfig | null>(null);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const t = getT(lang);

  // Restore saved matches from localStorage on mount if available
  useEffect(() => {
    const saved = loadMatchesFromStorage();
    if (saved) {
      setMatches(saved);
    }
  }, []);

  // Whenever matches, files, or stamp change, reset generated package so user regenerates fresh PDF
  useEffect(() => {
    if (packageBlobUrl) {
      URL.revokeObjectURL(packageBlobUrl);
      setPackageBlobUrl(null);
    }
  }, [matches, uploadedFiles, stampConfig]);

  // Handle Multi-file Upload (Rule 4.2 & 4.6)
  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const newErrors: string[] = [];
    const validProcessedFiles: UploadedFile[] = [];

    for (const file of filesArray) {
      // Rule 4.2: If file is not PDF, reject immediately
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        newErrors.push(`Rejected "${file.name}": Only valid PDF files are permitted.`);
        continue;
      }

      try {
        const hash = await computeFileHash(file);
        const inspection = await inspectPdf(file);

        if (inspection.error) {
          newErrors.push(`Rejected "${file.name}": ${inspection.error}`);
          continue;
        }

        const newUploadedFile: UploadedFile = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: inspection.pageCount,
          hash,
          isDuplicate: false,
          extractedText: inspection.extractedText,
          detectedExpiryDate: inspection.detectedExpiryDate,
        };

        validProcessedFiles.push(newUploadedFile);
      } catch (err: any) {
        newErrors.push(`Failed to read "${file.name}": ${err.message || 'Corrupt PDF'}`);
      }
    }

    if (newErrors.length > 0) {
      setNonPdfErrors(prev => [...prev, ...newErrors]);
    }

    if (validProcessedFiles.length > 0) {
      setUploadedFiles(prev => {
        const combined = [...prev, ...validProcessedFiles];

        // Rule 4.6: Find exact duplicates by sha-256 hash
        const hashMap = new Map<string, string[]>();
        combined.forEach(f => {
          const list = hashMap.get(f.hash) || [];
          list.push(f.id);
          hashMap.set(f.hash, list);
        });

        return combined.map(f => {
          const duplicates = (hashMap.get(f.hash) || []).filter(id => id !== f.id);
          return {
            ...f,
            isDuplicate: duplicates.length > 0,
            duplicateOf: duplicates.length > 0 ? duplicates : undefined,
          };
        });
      });
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const remaining = prev.filter(f => f.id !== fileId);

      // Re-evaluate duplicates
      const hashMap = new Map<string, string[]>();
      remaining.forEach(f => {
        const list = hashMap.get(f.hash) || [];
        list.push(f.id);
        hashMap.set(f.hash, list);
      });

      return remaining.map(f => {
        const duplicates = (hashMap.get(f.hash) || []).filter(id => id !== f.id);
        return {
          ...f,
          isDuplicate: duplicates.length > 0,
          duplicateOf: duplicates.length > 0 ? duplicates : undefined,
        };
      });
    });

    // Unmatch if file was matched
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(reqId => {
        if (next[reqId]?.fileId === fileId) {
          next[reqId] = { ...next[reqId], fileId: undefined };
        }
      });
      return next;
    });
  };

  // Match file to requirement (Rule 4.3)
  const handleMatchFile = (reqId: string, fileId: string) => {
    // Check if file is already matched to another requirement: enforce 1-to-1 mapping
    const matchedFile = uploadedFiles.find(f => f.id === fileId);
    setMatches(prev => {
      const next = { ...prev };

      // Free file if previously matched to another requirement
      Object.keys(next).forEach(key => {
        if (next[key]?.fileId === fileId && key !== reqId) {
          next[key] = { ...next[key], fileId: undefined };
        }
      });

      // Preserve existing expiryDate if user already typed it, otherwise auto-fill detectedExpiryDate
      const existingDate = next[reqId]?.expiryDate;
      const autoDate = matchedFile?.detectedExpiryDate;

      next[reqId] = {
        ...next[reqId],
        fileId,
        expiryDate: existingDate || autoDate || undefined,
      };
      return next;
    });
  };

  // Unmatch file from requirement
  const handleUnmatchFile = (reqId: string) => {
    setMatches(prev => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        fileId: undefined,
      },
    }));
  };

  // Update expiry date (Rule 4.4)
  const handleUpdateExpiryDate = (reqId: string, date: string) => {
    setMatches(prev => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        expiryDate: date,
      },
    }));
  };

  // 1-Click Smart Auto-Match (Fuzzy name & text similarity)
  const handleAutoMatch = () => {
    const available = [...uploadedFiles];
    const newMatches = { ...matches };

    tenderData.requirements.forEach(req => {
      // If already matched, skip
      if (newMatches[req.id]?.fileId) return;

      const titleEn = req.title_en.toLowerCase();
      const keywords = titleEn.split(/\s+/).filter(w => w.length > 2);

      // Find best file candidate
      const candidate = available.find(f => {
        const fname = f.file.name.toLowerCase();
        // Check filename matches keywords
        return keywords.some(k => fname.includes(k));
      });

      if (candidate) {
        newMatches[req.id] = {
          fileId: candidate.id,
          expiryDate: candidate.detectedExpiryDate || newMatches[req.id]?.expiryDate,
        };
        // Remove from available to ensure 1-to-1
        const idx = available.findIndex(a => a.id === candidate.id);
        if (idx !== -1) available.splice(idx, 1);
      }
    });

    setMatches(newMatches);
  };

  // Build evaluated items (Rules 4.5, 5.1 - 5.5)
  const evaluatedItems: EvaluationResult[] = useMemo(() => {
    return tenderData.requirements
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(req => {
        const matchData = matches[req.id];
        const matchedFile = uploadedFiles.find(f => f.id === matchData?.fileId);
        return evaluateRequirementStatus(
          req,
          matchedFile,
          matchData?.expiryDate,
          tenderData.tender.submission_deadline
        );
      });
  }, [tenderData, matches, uploadedFiles]);

  // Files available for matching
  const availableFiles = useMemo(() => {
    return uploadedFiles;
  }, [uploadedFiles]);

  // Master PDF Generation Engine (Rules 4.7, 4.8, Section 6)
  const handleGeneratePackage = async () => {
    const blockingItems = evaluatedItems.filter(i => i.isBlocking);
    if (blockingItems.length > 0) {
      alert(`Cannot generate package: ${blockingItems.length} blocking issues detected.`);
      return;
    }

    try {
      setIsGenerating(true);

      const itemsToInclude = evaluatedItems.filter(
        item => item.matchedFile && item.status !== 'NOT_PROVIDED'
      );

      const pdfBytes = await buildMasterPdfPackage({
        tender: tenderData.tender,
        items: itemsToInclude,
        stampConfig: stampConfig || undefined,
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPackageBlobUrl(url);

      // Trigger celebratory confetti!
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(`Package generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export CSV Checklist (Bonus task)
  const handleExportCsv = () => {
    exportChecklistCsv(tenderData.tender, evaluatedItems);
  };

  // Save session to LocalStorage (Bonus task)
  const handleSaveSession = () => {
    saveMatchesToStorage(matches);
    setHasSavedSession(true);
    setTimeout(() => setHasSavedSession(false), 3000);
  };

  // Reset all
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all files and matches?')) {
      setUploadedFiles([]);
      setMatches({});
      setNonPdfErrors([]);
      if (packageBlobUrl) {
        URL.revokeObjectURL(packageBlobUrl);
        setPackageBlobUrl(null);
      }
      clearMatchesFromStorage();
    }
  };

  // Load sample tender data
  const handleLoadSample = () => {
    setTenderData(SAMPLE_REQUIREMENTS);
  };

  // Custom requirements.json file loader (Rule 4.1)
  const handleCustomRequirementsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.tender || !parsed.requirements) {
          throw new Error('Invalid schema: Missing "tender" or "requirements" field');
        }
        setTenderData(parsed);
        setMatches({});
      } catch (err: any) {
        alert(`Failed to load requirements.json: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const blockingCount = evaluatedItems.filter(i => i.isBlocking).length;
  const okCount = evaluatedItems.filter(i => i.status === 'OK').length;

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      
      {/* HyperGrid 3D Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
        <MovingGrid className="w-full h-full pointer-events-none !bg-transparent">
          <div />
        </MovingGrid>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hidden file input for custom requirements.json */}
        <input
          type="file"
          ref={jsonInputRef}
          accept=".json,application/json"
          onChange={handleCustomRequirementsUpload}
          className="hidden"
        />

        {/* Header */}
        <Header
          lang={lang}
          onToggleLang={() => setLang(l => (l === 'en' ? 'bn' : 'en'))}
          tender={tenderData.tender}
          onLoadSample={handleLoadSample}
          onReset={handleReset}
          onUploadRequirementsClick={() => jsonInputRef.current?.click()}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-36">
          
          {/* Executive Tender Overview Briefing */}
          <TenderSummary tender={tenderData.tender} lang={lang} />

          {/* Workflow Cockpit Tabs Bar */}
          <div className="inline-flex items-center gap-2 p-1.5 bg-[#0c1326]/90 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-xl max-w-full overflow-x-auto">
            {/* Tab 1: Documents & Checklist */}
              <button
                onClick={() => setActiveTab('checklist')}
                className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 border ${
                  activeTab === 'checklist'
                    ? 'bg-slate-800/95 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  activeTab === 'checklist' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}>
                  01
                </span>
                <FileText className={`w-4 h-4 ${activeTab === 'checklist' ? 'text-emerald-400' : 'text-emerald-400/80'}`} />
                <span>{t.tabDocuments}</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                  okCount === evaluatedItems.length && evaluatedItems.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700/80'
                }`}>
                  {okCount}/{evaluatedItems.length}
                </span>
              </button>

              {/* Tab 2: Seal & Watermark */}
              <button
                onClick={() => setActiveTab('seal')}
                className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 border ${
                  activeTab === 'seal'
                    ? 'bg-slate-800/95 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  activeTab === 'seal' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}>
                  02
                </span>
                <Stamp className={`w-4 h-4 ${activeTab === 'seal' ? 'text-indigo-400' : 'text-indigo-400/80'}`} />
                <span>{t.tabSeal}</span>
                {stampConfig ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {t.tabAttached}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono">
                    {t.tabOptional}
                  </span>
                )}
              </button>

              {/* Tab 3: Compliance & Package Review */}
              <button
                onClick={() => setActiveTab('review')}
                className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 border ${
                  activeTab === 'review'
                    ? 'bg-slate-800/95 border-sky-500/50 text-white shadow-lg shadow-sky-950/40 ring-1 ring-sky-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  activeTab === 'review' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}>
                  03
                </span>
                <CheckCircle2 className={`w-4 h-4 ${activeTab === 'review' ? 'text-sky-400' : 'text-sky-400/80'}`} />
                <span>{t.tabAudit}</span>
                {blockingCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    {blockingCount}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {t.tabPass}
                  </span>
                )}
              </button>
            </div>

          {/* TAB 1: Documents & Checklist Workspace */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <UploadZone
                files={uploadedFiles}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onPreviewFile={setPreviewFile}
                nonPdfErrors={nonPdfErrors}
                onDismissNonPdfError={(idx) => setNonPdfErrors(prev => prev.filter((_, i) => i !== idx))}
                lang={lang}
              />

              <ChecklistTable
                items={evaluatedItems}
                availableFiles={availableFiles}
                onMatchFile={handleMatchFile}
                onUnmatchFile={handleUnmatchFile}
                onUpdateExpiryDate={handleUpdateExpiryDate}
                onPreviewFile={setPreviewFile}
                onAutoMatch={handleAutoMatch}
                lang={lang}
              />
            </div>
          )}

          {/* TAB 2: Official Seal & Security Workspace */}
          {activeTab === 'seal' && (
            <div className="space-y-6">
              <StampPanel
                lang={lang}
                stampConfig={stampConfig}
                onStampChange={setStampConfig}
              />
            </div>
          )}

          {/* TAB 3: Compliance & Package Review Workspace */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <StatusBanner
                tender={tenderData.tender}
                items={evaluatedItems}
                isGenerating={isGenerating}
                packageBlobUrl={packageBlobUrl}
                onGeneratePackage={handleGeneratePackage}
                onExportCsv={handleExportCsv}
                onSaveSession={handleSaveSession}
                hasSavedSession={hasSavedSession}
                lang={lang}
              />
            </div>
          )}

        </main>

        {/* Quick PDF Preview Modal */}
        <PdfPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          lang={lang}
        />

        {/* Floating Master Action Dock (Fixed at bottom across all views) */}
        <MasterActionDock
          tender={tenderData.tender}
          items={evaluatedItems}
          isGenerating={isGenerating}
          packageBlobUrl={packageBlobUrl}
          stampConfig={stampConfig}
          onGeneratePackage={handleGeneratePackage}
          onExportCsv={handleExportCsv}
          onSaveSession={handleSaveSession}
          hasSavedSession={hasSavedSession}
          lang={lang}
          onJumpToBlockers={() => setActiveTab('checklist')}
        />

        {/* Footer */}
        <footer className="border-t border-slate-900/80 bg-[#05080f]/90 py-5 text-center text-xs text-slate-500 font-mono">
          Tender Document Package Builder • 100% Client-Side In-Browser Architecture
        </footer>
      </div>
    </div>
  );
}

export default App;
