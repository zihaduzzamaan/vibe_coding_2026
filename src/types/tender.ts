export interface TenderMetadata {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: TenderMetadata;
  requirements: Requirement[];
}

export type DocumentStatus = 
  | 'MISSING'             // Required document, no file matched (Blocks)
  | 'EXPIRY_DATE_NEEDED'  // has_expiry=true & file matched, no expiry entered (Blocks)
  | 'EXPIRED'             // Expiry date before submission_deadline (Blocks)
  | 'NOT_PROVIDED'        // Optional document, no file matched (Does not block)
  | 'OK';                 // File matched & valid on/after submission_deadline (Does not block)

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  hash: string;           // SHA-256 for duplicate detection
  isDuplicate: boolean;
  duplicateOfName?: string;
  isPdf: boolean;
  error?: string;
  previewUrl?: string;
  extractedText?: string;
  detectedExpiryDate?: string;
}

export interface MatchedItem {
  requirementId: string;
  fileId?: string;
  expiryDate?: string;    // YYYY-MM-DD
}

export interface EvaluationResult {
  requirement: Requirement;
  matchedFile?: UploadedFile;
  expiryDate?: string;
  status: DocumentStatus;
  isBlocking: boolean;
  reason: string;
  reason_bn: string;
}

export interface StampConfig {
  file: File;
  previewUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center';
  targetPages: 'all-pages' | 'all-documents' | 'last-page' | 'cover-only';
  opacity: number; // 0.1 to 1.0
  width: number;   // points, e.g. 70
}

export type Language = 'en' | 'bn';
