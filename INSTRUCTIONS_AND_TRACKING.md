# Tender Document Package Builder — Master Instructions & Tracking

This document contains the complete technical specifications, acceptance criteria, trap handling, and progress tracking for all 13 modules of the **AI DevFest Tender Document Package Builder**.

---

## 📋 Comprehensive 13-Module Tracking Checklist

| # | Module / Title | Section Reference | Status | Priority |
| :---: | :--- | :--- | :---: | :---: |
| **01** | [Background & Operational Purpose](#01-background--operational-purpose) | Section 1 | ⏳ Ready | Essential |
| **02** | [System Architecture & Browser-Only Constraints](#02-system-architecture--browser-only-constraints) | Section 2, 8 | ⏳ Ready | Critical |
| **03** | [Tender Schema & Material Specification](#03-tender-schema--material-specification) | Section 3 | ⏳ Ready | Essential |
| **04** | [Task 4.1: Load & Parse Requirements](#04-task-41-load--parse-requirements) | Task 4.1 | ⏳ Ready | Core |
| **05** | [Task 4.2: Upload & Validate PDF Files](#05-task-42-upload--validate-pdf-files) | Task 4.2 | ⏳ Ready | Core |
| **06** | [Task 4.3: Document Matching Engine](#06-task-43-document-matching-engine) | Task 4.3 | ⏳ Ready | Core |
| **07** | [Task 4.4: Expiry Date Management](#07-task-44-expiry-date-management) | Task 4.4 | ⏳ Ready | Core |
| **08** | [Task 4.5 & Section 5: Real-Time Status Rules Engine](#08-task-45--section-5-real-time-status-rules-engine) | Task 4.5, Section 5 | ⏳ Ready | Critical |
| **09** | [Task 4.6: Duplicate Content Detection](#09-task-46-duplicate-content-detection) | Task 4.6 | ⏳ Ready | Critical |
| **10** | [Task 4.7 & Section 6: PDF Package Assembly & Cover Page](#10-task-47--section-6-pdf-package-assembly--cover-page) | Task 4.7, Section 6 | ⏳ Ready | Critical |
| **11** | [Task 4.8: Package Download & Naming](#11-task-48-package-download--naming) | Task 4.8 | ⏳ Ready | Core |
| **12** | [Task 4.9: Bilingual Localization (English & Bangla)](#12-task-49-bilingual-localization-english--bangla) | Task 4.9 | ⏳ Ready | Core |
| **13** | [Section 7: Bonus Features & Resilience Toolkit](#13-section-7-bonus-features--resilience-toolkit) | Section 7 | ⏳ Ready | High Value |

---

## Detailed Specifications & Tracking

### 01. Background & Operational Purpose
* **Reference**: Problem Statement Section 1
* **Objective**: Automate the manual, error-prone compilation of government and commercial tender bid document packages.
* **Key Challenges Addressed**:
  - Eliminating missed mandatory documents.
  - Catching expired certifications before submission.
  - Preventing duplicate file attachments.
  - Ensuring strict, compliant ordering of technical proposals, financial bids, and licenses.
* **Tracking**:
  - [ ] Context and purpose clearly presented in the application onboarding.

---

### 02. System Architecture & Browser-Only Constraints
* **Reference**: Problem Statement Section 2 & 8
* **Objective**: Zero-server, 100% client-side privacy architecture.
* **Strict Constraints**:
  - [ ] **No server upload**: All PDF parsing, hashing, merging, and rendering occurs in the browser.
  - [ ] **Limits handled**: Up to 30 files, up to 50 MB total.
  - [ ] **Compatibility**: Fully validated in Google Chrome.
  - [ ] **Tech Stack**: Vite + React + Tailwind CSS + `pdf-lib` + `pdfjs-dist` + Lucide Icons.

---

### 03. Tender Schema & Material Specification
* **Reference**: Problem Statement Section 3 & `requirements.json`
* **Objective**: Ingest and structure tender configuration data.
* **Data Fields**:
  - Tender header: `tender_id`, `title`, `procuring_entity`, `bidder`, `submission_deadline`.
  - Requirements list: `id`, `order`, `title_en`, `title_bn`, `mandatory`, `has_expiry`.
* **Tracking**:
  - [ ] Strict TypeScript interface definitions for `TenderMetadata` and `Requirement`.
  - [ ] Fallback support for loading sample `requirements.json` directly with 1 click.

---

### 04. Task 4.1: Load & Parse Requirements
* **Reference**: Problem Statement Task 4.1
* **Objective**: Enable user to load `requirements.json` via file input or drag-and-drop.
* **Functional Requirements**:
  - [ ] Display tender details in a dedicated header summary card.
  - [ ] Display the checklist of required documents sorted strictly in ascending `order` (1 to N).
  - [ ] Indicate mandatory vs optional tags for every row.
* **Tracking**:
  - [ ] File reader validates JSON syntax and schema completeness.
  - [ ] Informative error notification if JSON is corrupted or improperly formatted.

---

### 05. Task 4.2: Upload & Validate PDF Files
* **Reference**: Problem Statement Task 4.2
* **Objective**: Multi-file batch upload with immediate validation and page counting.
* **Functional Requirements**:
  - [ ] Accept multi-file selection and drag-and-drop zone.
  - [ ] Display each file name, size, and page count extracted via `pdfjs-dist` / `pdf-lib`.
  - [ ] **Non-PDF Rejection Trap**: Detect non-PDF files (e.g. `company_logo.png`). Reject immediately and display an explicit error alert.
  - [ ] Allow removing any uploaded file with single click.
* **Tracking**:
  - [ ] Non-PDF rejection tested with sample `company_logo.png`.
  - [ ] Real-time total file count and size indicators.

---

### 06. Task 4.3: Document Matching Engine
* **Reference**: Problem Statement Task 4.3
* **Objective**: Map uploaded files to required tender checklist items.
* **Functional Requirements**:
  - [ ] Strict 1-to-1 matching constraint:
    - One document gets at most one file.
    - One file goes to at most one document.
  - [ ] Instant match reversal (undo/unmatch button).
  - [ ] Dropdown or drag-to-match UI showing unassigned files.
  - [ ] Quick preview modal for any matched file.
* **Tracking**:
  - [ ] 1-to-1 constraint enforced across all operations.
  - [ ] Reassigning a file cleanly frees up its previous assignment.

---

### 07. Task 4.4: Expiry Date Management
* **Reference**: Problem Statement Task 4.4
* **Objective**: Input and validate expiration dates for documents where `has_expiry = true`.
* **Functional Requirements**:
  - [ ] When a file is matched to a requirement with `has_expiry = true`, present an expiry date picker input (`YYYY-MM-DD`).
  - [ ] Auto-suggest / OCR extraction: Automatically pre-fill the expiry date if found in the document text (e.g. `2026-12-31` from Bank Solvency).
  - [ ] Manual override allowed at any time.
* **Tracking**:
  - [ ] Date input validates format and compares against `submission_deadline`.

---

### 08. Task 4.5 & Section 5: Real-Time Status Rules Engine
* **Reference**: Problem Statement Task 4.5 & Section 5
* **Objective**: Compute exact compliance status for every document immediately upon any change.
* **The 5 Definitive Status States**:
  1. 🔴 **`Missing`** — Mandatory requirement with no file matched. *(Blocks generation)*
  2. 🟡 **`Expiry date needed`** — `has_expiry = true` & file matched, but expiry date is blank. *(Blocks generation)*
  3. 🔴 **`Expired`** — Expiry date is before `submission_deadline`. *(Blocks generation)*
  4. ⚪ **`Not provided`** — Optional requirement (`mandatory = false`) with no file matched. *(Does NOT block)*
  5. 🟢 **`OK`** — File matched, and (if `has_expiry`) expiry date is on or after `submission_deadline`. *(Does NOT block)*
* **Edge Case**: If expiry date == `submission_deadline`, status must evaluate to **`OK`**.
* **Tracking**:
  - [ ] Live status badge for every checklist row.
  - [ ] Global validation banner summarizing blocking errors.

---

### 09. Task 4.6: Duplicate Content Detection
* **Reference**: Problem Statement Task 4.6
* **Objective**: Identify files with identical byte content even under different file names.
* **Functional Requirements**:
  - [ ] Compute cryptographic hash (SHA-256) of every uploaded file upon ingestion.
  - [ ] Detect exact duplicates (e.g. `experience_cert.pdf` and `experience_cert (1).pdf`).
  - [ ] Mark duplicate files in the uploaded file manager with visual warning tag.
  - [ ] Prohibit assigning duplicate files to different requirements simultaneously.
* **Tracking**:
  - [ ] Tested against sample pack `experience_cert.pdf` pair.
  - [ ] Duplicate warning message explains that duplicate contents cannot be used twice.

---

### 10. Task 4.7 & Section 6: PDF Package Assembly & Cover Page
* **Reference**: Problem Statement Task 4.7 & Section 6
* **Objective**: Client-side generation of the single master PDF package.
* **Rules & Layout**:
  - [ ] **Generate Button State**: Disabled while ANY document has a blocking status (`Missing`, `Expiry date needed`, `Expired`). Shows a tooltip/modal listing why.
  - [ ] **Page 1: Cover Page** (English):
    - Clean, professional typography.
    - Fields: Tender ID, Tender Title, Procuring Entity, Bidder Name, Submission Deadline, Package Generation Date.
    - Ordered table of all included documents with their original page count.
  - [ ] **Document Sequencing**: Concatenate all pages of matched files strictly in ascending `order` (1 to 10). Skip optional unprovided files.
  - [ ] **Running Header / Footer**:
    - Bottom footer on EVERY page (including cover): `<tender_id> | Page X of Y`.
    - Total page count `Y` accurately computed.
    - Footer placed cleanly in margin without obscuring content.
* **Tracking**:
  - [ ] `pdf-lib` merges binary streams seamlessly in memory.
  - [ ] Cover page styled to professional standards.

---

### 11. Task 4.8: Package Download & Naming
* **Reference**: Problem Statement Task 4.8
* **Objective**: Export the compiled binary directly to user's local disk.
* **Functional Requirements**:
  - [ ] File downloaded with exact pattern: `<tender_id>_Package.pdf` (e.g. `T-2026-0417_Package.pdf`).
  - [ ] Triggers standard browser download prompt with accurate MIME type (`application/pdf`).
  - [ ] Generation completes in < 3 seconds on modern hardware.
* **Tracking**:
  - [ ] Verified file naming on downloaded test packages.

---

### 12. Task 4.9: Bilingual Localization (English & Bangla)
* **Reference**: Problem Statement Task 4.9
* **Objective**: Full bilingual UI support.
* **Functional Requirements**:
  - [ ] Persistent language toggle in header (`English` / `বাংলা`).
  - [ ] Checklist displays `title_en` in English mode and `title_bn` in Bangla mode.
  - [ ] All buttons, status badges, errors, and instructions translate fluently.
  - [ ] Clean Bengali typography support (Noto Sans Bengali / system fallback).
* **Tracking**:
  - [ ] Every UI string has an exact bilingual dictionary pair.

---

### 13. Section 7: Bonus Features & Resilience Toolkit
* **Reference**: Problem Statement Section 7
* **High-Impact Bonus Capabilities**:
  - [ ] **Interactive Table of Contents (Index Page)**: Generated after cover page showing start page number of every document.
  - [ ] **Seal & Signature Placement**: Upload a PNG stamp/signature and place it on chosen document pages with adjustable position/scale.
  - [ ] **Checklist Export (CSV / Excel)**: 1-click export of the validation checklist (`Document`, `File`, `Pages`, `Expiry`, `Status`).
  - [ ] **Project Save & Resume**: Export/import project `.json` session state or auto-persist to `localStorage`.
  - [ ] **Auto-Match Heuristics**: Automatic recommendation engine based on filenames and OCR string similarity.
  - [ ] **Damaged / Password-Protected PDF Handling**: Gracefully catch corrupt or encrypted files with an informative dialog instead of crashing.
* **Tracking**:
  - [ ] Bonus features accessible without cluttering the primary workflow.
