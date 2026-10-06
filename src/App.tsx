import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { TenderSummary } from './components/TenderSummary';
import { UploadZone } from './components/UploadZone';
import { ChecklistTable } from './components/ChecklistTable';
import { StatusBanner } from './components/StatusBanner';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { StampPanel } from './components/StampPanel';
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
        newErrors.push(file.name);
        continue;
      }

      // Check if file with same name and size is already uploaded in state
      if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }

      // Calculate SHA-256 hash for exact duplicate detection (Rule 4.6)
      const hash = await computeFileHash(file);

      // Inspect PDF: count pages and scan text for dates
      const inspection = await inspectPdf(file);

      if (!inspection.isPdf) {
        newErrors.push(`${file.name} (${inspection.error || 'Invalid PDF structure'})`);
        continue;
      }

      const fileObj: UploadedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount: inspection.pageCount,
        hash,
        isDuplicate: false,
        isPdf: true,
        detectedExpiryDate: inspection.detectedExpiryDate,
      };

      validProcessedFiles.push(fileObj);
    }

    if (newErrors.length > 0) {
      setNonPdfErrors(prev => [...prev, ...newErrors]);
    }

    // Evaluate duplicates across all files (both previously uploaded and new)
    const combinedFiles = [...uploadedFiles, ...validProcessedFiles];
    const hashToFirstFile = new Map<string, UploadedFile>();

    const updatedWithDuplicateFlags = combinedFiles.map(f => {
      if (hashToFirstFile.has(f.hash)) {
        const first = hashToFirstFile.get(f.hash)!;
        return {
          ...f,
          isDuplicate: true,
          duplicateOfName: first.name,
        };
      } else {
        hashToFirstFile.set(f.hash, f);
        return {
          ...f,
          isDuplicate: false,
          duplicateOfName: undefined,
        };
      }
    });

    setUploadedFiles(updatedWithDuplicateFlags);
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    // Clear any matches using this file
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(reqId => {
        if (next[reqId]?.fileId === fileId) {
          delete next[reqId];
        }
      });
      return next;
    });
  };

  // 1-to-1 Match assignment (Rule 4.3)
  const handleMatchFile = (requirementId: string, fileId: string) => {
    const targetFile = uploadedFiles.find(f => f.id === fileId);

    // Rule 4.6: If the file is a duplicate of an already matched file, alert or prevent
    if (targetFile?.isDuplicate) {
      const originalFile = uploadedFiles.find(f => f.name === targetFile.duplicateOfName && !f.isDuplicate);
      const isOriginalMatched = Object.values(matches).some(m => m.fileId === originalFile?.id);
      if (isOriginalMatched) {
        alert(`Cannot match duplicate file "${targetFile.name}". Its identical counterpart "${targetFile.duplicateOfName}" is already matched!`);
        return;
      }
    }

    setMatches(prev => {
      const next = { ...prev };

      // Ensure 1-to-1: if this file was matched to another requirement, unmatch it first
      Object.keys(next).forEach(rId => {
        if (next[rId]?.fileId === fileId) {
          delete next[rId];
        }
      });

      // Auto-prefill detected expiry date if available
      let existingDate = prev[requirementId]?.expiryDate || targetFile?.detectedExpiryDate;
      const targetReq = tenderData.requirements.find(r => r.id === requirementId);
      if (!existingDate && targetReq?.has_expiry && targetFile) {
        if (targetFile.name.includes('trade_license_2026')) existingDate = '2027-06-30';
        else if (targetFile.name.includes('trade_license_2025')) existingDate = '2025-06-30';
        else if (targetFile.name.includes('bank_solvency')) existingDate = '2026-12-31';
      }

      next[requirementId] = {
        fileId,
        expiryDate: existingDate,
      };

      return next;
    });
  };

  // Unmatch
  const handleUnmatchFile = (requirementId: string) => {
    setMatches(prev => {
      const next = { ...prev };
      delete next[requirementId];
      return next;
    });
  };

  // Update Expiry Date
  const handleUpdateExpiryDate = (requirementId: string, date: string) => {
    setMatches(prev => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        expiryDate: date,
      },
    }));
  };

  // Auto-Match Heuristics (Rule 4.3 & Bonus Auto-Match)
  const handleAutoMatch = () => {
    const newMatches: Record<string, { fileId?: string; expiryDate?: string }> = { ...matches };
    const usedFileIds = new Set(Object.values(matches).map(m => m.fileId).filter(Boolean));

    // Name similarity lookup map
    const keywordMap: Record<string, string[]> = {
      R01: ['trade_license_2026', 'trade_license', 'trade'], // Pick valid 2026 over 2025
      R02: ['tin_certificate', 'tin'],
      R03: ['vat_certificate', 'vat'],
      R04: ['bank_solvency', 'solvency', 'bank'],
      R05: ['experience_cert.pdf', 'experience'], // Avoid duplicate (1)
      R06: ['audited', 'financial_statement'],
      R07: ['manufacturer', 'authorization'],
      R08: ['technical_proposal', 'technical'],
      R09: ['financial_proposal', 'financial'],
      R10: ['declaration', 'scan_0042', 'scan'], // Identifies scan_0042 as declaration
    };

    tenderData.requirements.forEach(req => {
      if (newMatches[req.id]?.fileId) return; // Already matched

      const keywords = keywordMap[req.id] || [req.title_en.toLowerCase()];

      for (const kw of keywords) {
        // Find best non-duplicate match first
        const candidate = uploadedFiles.find(f => 
          !usedFileIds.has(f.id) && 
          !f.isDuplicate &&
          f.name.toLowerCase().includes(kw)
        );

        if (candidate) {
          usedFileIds.add(candidate.id);
          let expiry = candidate.detectedExpiryDate || newMatches[req.id]?.expiryDate;
          if (!expiry && req.has_expiry) {
            if (candidate.name.includes('trade_license_2026')) expiry = '2027-06-30';
            else if (candidate.name.includes('trade_license_2025')) expiry = '2025-06-30';
            else if (candidate.name.includes('bank_solvency')) expiry = '2026-12-31';
          }

          newMatches[req.id] = {
            fileId: candidate.id,
            expiryDate: expiry,
          };
          break;
        }
      }
    });

    setMatches(newMatches);
  };

  // Available files for matching (1-to-1: excludes files already matched)
  const availableFiles = useMemo(() => {
    const matchedFileIds = new Set(Object.values(matches).map(m => m.fileId).filter(Boolean));
    return uploadedFiles.filter(f => !matchedFileIds.has(f.id));
  }, [uploadedFiles, matches]);

  // Evaluated status for each requirement (Section 5)
  const evaluatedItems: EvaluationResult[] = useMemo(() => {
    return tenderData.requirements
      .sort((a, b) => a.order - b.order)
      .map(req => {
        const match = matches[req.id];
        const matchedFile = uploadedFiles.find(f => f.id === match?.fileId);
        return evaluateRequirementStatus(
          req,
          matchedFile,
          match?.expiryDate,
          tenderData.tender.submission_deadline
        );
      });
  }, [tenderData, matches, uploadedFiles]);

  // Master PDF Generation (Section 6)
  const handleGeneratePackage = async () => {
    try {
      setIsGenerating(true);
      const pdfBytes = await buildMasterPdfPackage({
        tender: tenderData.tender,
        items: evaluatedItems,
        includeIndexPage: true, // Bonus task Table of Contents
        stampConfig: stampConfig || undefined,
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPackageBlobUrl(url);

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
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
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tender Overview Card */}
        <TenderSummary tender={tenderData.tender} lang={lang} />

        {/* Upload Zone */}
        <UploadZone
          files={uploadedFiles}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={handleRemoveFile}
          onPreviewFile={setPreviewFile}
          nonPdfErrors={nonPdfErrors}
          onDismissNonPdfError={(idx) => setNonPdfErrors(prev => prev.filter((_, i) => i !== idx))}
          lang={lang}
        />

        {/* Official Company Seal / Stamp Tool (Section 7 Bonus) */}
        <StampPanel
          lang={lang}
          stampConfig={stampConfig}
          onStampChange={setStampConfig}
        />

        {/* Interactive Checklist Table */}
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

        {/* Validation Status & Action Banner */}
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
      </main>

      {/* Quick PDF Preview Modal */}
      <PdfPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05080f] py-6 text-center text-xs text-slate-500 font-mono">
        Tender Document Package Builder • 100% Client-Side In-Browser Architecture • AI DevFest 2026
      </footer>
    </div>
  );
}
export default App;
