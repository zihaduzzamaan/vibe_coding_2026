# Task List: Tender Document Package Builder

## Phase 1: Project Setup & Core Foundation
- [x] 1.1 Create `task.md` and initialize Vite + React + TypeScript + Tailwind CSS project <!-- id: 1.1 -->
- [x] 1.2 Install core dependencies (`pdf-lib`, `pdfjs-dist`, `lucide-react`, `canvas-confetti`, `clsx`, `tailwind-merge`) <!-- id: 1.2 -->
- [x] 1.3 Configure Tailwind CSS and setup high-end design system tokens & Google Fonts (Inter + Hind Siliguri for Bangla) <!-- id: 1.3 -->
- [x] 1.4 Setup bilingual localization dictionary (English & বাংলা) <!-- id: 1.4 -->

## Phase 2: Core Data Types & Engine Logic
- [x] 2.1 Define strict TypeScript interfaces (`TenderMetadata`, `Requirement`, `UploadedFile`, `MatchState`, `StatusType`) <!-- id: 2.1 -->
- [x] 2.2 Implement SHA-256 client-side file hasher and duplicate detector <!-- id: 2.2 -->
- [x] 2.3 Implement PDF inspector (page count extractor & text extractor using `pdfjs-dist` / `pdf-lib`) <!-- id: 2.3 -->
- [x] 2.4 Implement strict 5-state Status Rules Engine (`Missing`, `Expiry date needed`, `Expired`, `Not provided`, `OK`) <!-- id: 2.4 -->
- [x] 2.5 Implement 1-to-1 matching engine with auto-match heuristics <!-- id: 2.5 -->

## Phase 3: High-End UI Construction
- [x] 3.1 Header bar with Tender Title, Bilingual Switcher (EN/BN), and Quick Load Sample button <!-- id: 3.1 -->
- [x] 3.2 Tender Overview Card displaying metadata (Tender ID, Bidder, Deadline, Entity) <!-- id: 3.2 -->
- [x] 3.3 File Upload Zone with drag-and-drop, non-PDF rejection banner, and duplicate warning indicators <!-- id: 3.3 -->
- [x] 3.4 Interactive Checklist Table sorted by `order` (1–10) with matching controls, expiry date picker, and live status badges <!-- id: 3.4 -->
- [x] 3.5 Quick PDF Preview Modal to inspect any uploaded/matched document <!-- id: 3.5 -->

## Phase 4: PDF Package Assembly Engine (`pdf-lib`)
- [x] 4.1 Page 1 Cover Page Generator (English, structured table of included documents, metadata) <!-- id: 4.1 -->
- [x] 4.2 Bonus Table of Contents / Index Page Generator with exact starting page numbers <!-- id: 4.2 -->
- [x] 4.3 Multi-PDF Concatenation Engine preserving original order and pages <!-- id: 4.3 -->
- [x] 4.4 Running Footer Injector (`<tender_id> | Page X of Y`) on every page without obscuring content <!-- id: 4.4 -->
- [x] 4.5 Package Downloader with exact file naming `<tender_id>_Package.pdf` <!-- id: 4.5 -->

## Phase 5: Bonus Features & Quality Polish
- [x] 5.1 CSV / Excel Checklist Export (`Document`, `File`, `Pages`, `Expiry`, `Status`) <!-- id: 5.1 -->
- [x] 5.2 Seal / Stamp PNG Placement tool <!-- id: 5.2 -->
- [x] 5.3 Session Persistence (`localStorage` auto-save and JSON export/import) <!-- id: 5.3 -->
- [x] 5.4 Error Boundary & Damaged/Encrypted PDF resilience <!-- id: 5.4 -->
- [x] 5.5 Visual polish, micro-animations, and end-to-end testing with sample pack <!-- id: 5.5 -->
- [x] 5.6 Capture required contest screenshots and generate final sample package <!-- id: 5.6 -->

