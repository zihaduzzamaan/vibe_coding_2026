import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TenderMetadata, EvaluationResult, StampConfig } from '../types/tender';

export interface BuildPackageOptions {
  tender: TenderMetadata;
  items: EvaluationResult[];
  includeIndexPage?: boolean;
  stampConfig?: StampConfig;
}

/**
 * Builds the complete, compliant master PDF package following Section 6 rules
 */
export async function buildMasterPdfPackage({
  tender,
  items,
  includeIndexPage = true,
  stampConfig,
}: BuildPackageOptions): Promise<Uint8Array> {
  const masterDoc = await PDFDocument.create();
  const helvetica = await masterDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await masterDoc.embedFont(StandardFonts.HelveticaBold);

  // Filter only matched documents in ascending requirement order
  const validItems = items
    .filter(i => i.status === 'OK' && i.matchedFile)
    .sort((a, b) => a.requirement.order - b.requirement.order);

  const generationDate = new Date().toISOString().split('T')[0];

  // =========================================================================
  // 1. PAGE 1: COVER PAGE (English, strictly following Rule 6.1)
  // =========================================================================
  const coverPage = masterDoc.addPage([595.28, 841.89]); // Standard A4 portrait
  const { width, height } = coverPage.getSize();

  // Top header banner background
  coverPage.drawRectangle({
    x: 40,
    y: height - 145,
    width: width - 80,
    height: 95,
    color: rgb(0.06, 0.12, 0.22), // Deep navy
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 60,
    y: height - 85,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText(`Tender ID: ${tender.tender_id}  |  Official Bid Submission`, {
    x: 60,
    y: height - 110,
    size: 11,
    font: helvetica,
    color: rgb(0.35, 0.75, 0.55),
  });

  // Tender Metadata Details Card
  let curY = height - 175;
  const metaBoxHeight = 110;
  coverPage.drawRectangle({
    x: 40,
    y: curY - metaBoxHeight,
    width: width - 80,
    height: metaBoxHeight,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  const drawMetaRow = (label: string, val: string, yPos: number) => {
    coverPage.drawText(label, {
      x: 55,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.35),
    });
    coverPage.drawText(val, {
      x: 195,
      y: yPos,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.15),
    });
  };

  drawMetaRow('Tender Title:', tender.title, curY - 25);
  drawMetaRow('Procuring Entity:', tender.procuring_entity, curY - 45);
  drawMetaRow('Bidder Name:', tender.bidder, curY - 65);
  drawMetaRow('Submission Deadline:', tender.submission_deadline, curY - 85);
  drawMetaRow('Package Date:', generationDate, curY - 105);

  curY -= (metaBoxHeight + 35);

  // Table of Included Documents Header
  coverPage.drawText('LIST OF INCLUDED DOCUMENTS', {
    x: 40,
    y: curY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.08, 0.15, 0.28),
  });

  curY -= 20;

  // Table header
  coverPage.drawRectangle({
    x: 40,
    y: curY - 5,
    width: width - 80,
    height: 22,
    color: rgb(0.12, 0.18, 0.3),
  });

  coverPage.drawText('#', { x: 50, y: curY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
  coverPage.drawText('Document Name', { x: 80, y: curY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
  coverPage.drawText('Attached File', { x: 260, y: curY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
  coverPage.drawText('Pages', { x: 440, y: curY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
  coverPage.drawText('Status', { x: 495, y: curY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });

  curY -= 22;

  // Rows
  validItems.forEach((item, index) => {
    const isEven = index % 2 === 0;
    coverPage.drawRectangle({
      x: 40,
      y: curY - 4,
      width: width - 80,
      height: 20,
      color: isEven ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
    });

    const docOrder = `${item.requirement.order}`;
    const docTitle = item.requirement.title_en.slice(0, 32);
    const fileName = (item.matchedFile?.name || '').slice(0, 30);
    const pages = `${item.matchedFile?.pageCount || 1}`;

    coverPage.drawText(docOrder, { x: 50, y: curY + 2, size: 8.5, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText(docTitle, { x: 80, y: curY + 2, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    coverPage.drawText(fileName, { x: 260, y: curY + 2, size: 8, font: helvetica, color: rgb(0.25, 0.3, 0.4) });
    coverPage.drawText(pages, { x: 445, y: curY + 2, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    coverPage.drawText('Verified OK', { x: 495, y: curY + 2, size: 8, font: helveticaBold, color: rgb(0.08, 0.55, 0.25) });

    curY -= 20;
  });

  // =========================================================================
  // 2. BONUS: TABLE OF CONTENTS / INDEX PAGE (Rule Section 7)
  // =========================================================================
  let indexPageNumber = 0;
  if (includeIndexPage) {
    const indexPage = masterDoc.addPage([595.28, 841.89]);
    indexPageNumber = 2; // Page 2

    indexPage.drawRectangle({
      x: 40,
      y: height - 110,
      width: width - 80,
      height: 60,
      color: rgb(0.06, 0.12, 0.22),
    });

    indexPage.drawText('TABLE OF CONTENTS / INDEX', {
      x: 60,
      y: height - 75,
      size: 16,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    indexPage.drawText('Starting page numbers for every included document', {
      x: 60,
      y: height - 95,
      size: 9.5,
      font: helvetica,
      color: rgb(0.7, 0.75, 0.85),
    });
  }

  // Calculate starting page numbers
  // Page 1 is Cover. Page 2 is Index (if enabled). First document starts on page 2 or 3.
  let runningPageNumber = includeIndexPage ? 3 : 2;
  const itemStartPages: { item: EvaluationResult; startPage: number }[] = [];

  // =========================================================================
  // 3. MERGE MATCHED PDF DOCUMENTS (In strict requirement order)
  // =========================================================================
  for (const item of validItems) {
    if (!item.matchedFile) continue;

    itemStartPages.push({ item, startPage: runningPageNumber });

    const fileBuffer = await item.matchedFile.file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const pageIndices = sourceDoc.getPageIndices();

    const copiedPages = await masterDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      masterDoc.addPage(page);
      runningPageNumber++;
    }
  }

  // Populate Index Page rows now that exact start pages are known
  if (includeIndexPage) {
    const indexPage = masterDoc.getPage(1); // 0-indexed: page 2 is index
    let idxY = height - 150;

    indexPage.drawRectangle({
      x: 40,
      y: idxY - 5,
      width: width - 80,
      height: 22,
      color: rgb(0.12, 0.18, 0.3),
    });

    indexPage.drawText('Order', { x: 50, y: idxY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Document Name', { x: 100, y: idxY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Pages Count', { x: 370, y: idxY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Start Page #', { x: 470, y: idxY + 2, size: 9, font: helveticaBold, color: rgb(1, 1, 1) });

    idxY -= 22;

    itemStartPages.forEach(({ item, startPage }, i) => {
      const isEven = i % 2 === 0;
      indexPage.drawRectangle({
        x: 40,
        y: idxY - 4,
        width: width - 80,
        height: 22,
        color: isEven ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.9, 0.92, 0.95),
        borderWidth: 0.5,
      });

      indexPage.drawText(`${item.requirement.order}`, { x: 55, y: idxY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
      indexPage.drawText(item.requirement.title_en, { x: 100, y: idxY + 3, size: 9, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
      indexPage.drawText(`${item.matchedFile?.pageCount || 1} pages`, { x: 370, y: idxY + 3, size: 9, font: helvetica, color: rgb(0.3, 0.35, 0.45) });
      indexPage.drawText(`Page ${startPage}`, { x: 475, y: idxY + 3, size: 9, font: helveticaBold, color: rgb(0.1, 0.35, 0.75) });

      idxY -= 22;
    });
  }

  // =========================================================================
  // 4. RUNNING FOOTER ON EVERY PAGE (Rules 6.3 & 6.4)
  // Format: <tender_id> | Page X of Y
  // =========================================================================
  const totalPages = masterDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = masterDoc.getPage(i);
    const pWidth = page.getWidth();

    const footerText = `${tender.tender_id}  |  Page ${i + 1} of ${totalPages}`;
    const textWidth = helvetica.widthOfTextAtSize(footerText, 8.5);

    // Subtle divider line at bottom margin
    page.drawLine({
      start: { x: 35, y: 30 },
      end: { x: pWidth - 35, y: 30 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    // Centered, legible footer
    page.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 18,
      size: 8.5,
      font: helvetica,
      color: rgb(0.35, 0.4, 0.45),
    });
  }

  // =========================================================================
  // 5. BONUS: COMPANY SEAL / STAMP PLACEMENT (Section 7 Bonus)
  // =========================================================================
  if (stampConfig && stampConfig.file) {
    try {
      const stampBuffer = await stampConfig.file.arrayBuffer();
      const isPng = stampConfig.file.type.includes('png') || stampConfig.file.name.toLowerCase().endsWith('.png');
      let embeddedImg;
      if (isPng) {
        embeddedImg = await masterDoc.embedPng(stampBuffer);
      } else {
        embeddedImg = await masterDoc.embedJpg(stampBuffer);
      }

      const originalDims = embeddedImg.scale(1.0);
      const targetW = stampConfig.width || 70;
      const targetH = originalDims.height * (targetW / originalDims.width);

      const totalPgs = masterDoc.getPageCount();
      for (let pIdx = 0; pIdx < totalPgs; pIdx++) {
        let shouldStamp = false;
        if (stampConfig.targetPages === 'all-pages') {
          shouldStamp = true;
        } else if (stampConfig.targetPages === 'cover-only' && pIdx === 0) {
          shouldStamp = true;
        } else if (stampConfig.targetPages === 'all-documents' && pIdx >= (includeIndexPage ? 2 : 1)) {
          shouldStamp = true;
        } else if (stampConfig.targetPages === 'last-page' && pIdx === totalPgs - 1) {
          shouldStamp = true;
        }

        if (shouldStamp) {
          const page = masterDoc.getPage(pIdx);
          const { width: pWidth, height: pHeight } = page.getSize();
          let posX = 40;
          let posY = 45; // above footer at y=30

          if (stampConfig.position === 'bottom-right') {
            posX = pWidth - targetW - 40;
            posY = 45;
          } else if (stampConfig.position === 'bottom-left') {
            posX = 40;
            posY = 45;
          } else if (stampConfig.position === 'top-right') {
            posX = pWidth - targetW - 40;
            posY = pHeight - targetH - 45;
          } else if (stampConfig.position === 'bottom-center') {
            posX = (pWidth - targetW) / 2;
            posY = 45;
          }

          page.drawImage(embeddedImg, {
            x: posX,
            y: posY,
            width: targetW,
            height: targetH,
            opacity: stampConfig.opacity ?? 0.85,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to embed seal/stamp image:', err);
    }
  }

  return await masterDoc.save();
}
