import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateSamplePackage() {
  const tender = {
    tender_id: "T-2026-0417",
    title: "Supply of IT Equipment",
    procuring_entity: "Directorate of Sample Services",
    bidder: "Meghna Tech Solutions Ltd.",
    submission_deadline: "2026-10-20"
  };

  const docsDir = 'Problems/problem-pack/sample-pack/documents';

  // Resolved list of files for the 10 requirements:
  const includedDocs = [
    { order: 1, id: 'R01', title: 'Trade License', filename: 'trade_license_2026.pdf', expiry: '2027-06-30' },
    { order: 2, id: 'R02', title: 'TIN Certificate', filename: '03_tin_certificate.pdf', expiry: 'N/A' },
    { order: 3, id: 'R03', title: 'VAT Registration Certificate', filename: '04_vat_certificate.pdf', expiry: 'N/A' },
    { order: 4, id: 'R04', title: 'Bank Solvency Certificate', filename: 'bank_solvency.pdf', expiry: '2026-12-31' },
    { order: 5, id: 'R05', title: 'Experience Certificate', filename: 'experience_cert.pdf', expiry: 'N/A' },
    // R06 & R07 are optional and not provided
    { order: 8, id: 'R08', title: 'Technical Proposal', filename: '02_technical_proposal.pdf', expiry: 'N/A' },
    { order: 9, id: 'R09', title: 'Financial Proposal', filename: '01_financial_proposal.pdf', expiry: 'N/A' },
    { order: 10, id: 'R10', title: 'Signed Declaration', filename: 'scan_0042.pdf', expiry: 'N/A' },
  ];

  const masterDoc = await PDFDocument.create();
  const helvetica = await masterDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await masterDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. COVER PAGE (Page 1)
  const coverPage = masterDoc.addPage([595.28, 841.89]);
  const { width, height } = coverPage.getSize();

  // Top banner
  coverPage.drawRectangle({
    x: 40,
    y: height - 145,
    width: width - 80,
    height: 95,
    color: rgb(0.06, 0.12, 0.22),
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

  // Metadata Card
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

  const drawMetaRow = (label, val, yPos) => {
    coverPage.drawText(label, { x: 55, y: yPos, size: 10, font: helveticaBold, color: rgb(0.2, 0.25, 0.35) });
    coverPage.drawText(val, { x: 195, y: yPos, size: 10, font: helvetica, color: rgb(0.1, 0.1, 0.15) });
  };

  const generationDate = new Date().toISOString().split('T')[0];
  drawMetaRow('Tender Title:', tender.title, curY - 25);
  drawMetaRow('Procuring Entity:', tender.procuring_entity, curY - 45);
  drawMetaRow('Bidder Name:', tender.bidder, curY - 65);
  drawMetaRow('Submission Deadline:', tender.submission_deadline, curY - 85);
  drawMetaRow('Package Date:', generationDate, curY - 105);

  curY -= (metaBoxHeight + 35);

  coverPage.drawText('LIST OF INCLUDED DOCUMENTS', {
    x: 40,
    y: curY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.08, 0.15, 0.28),
  });

  curY -= 20;

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

  // Read docs to know page counts
  const loadedDocs = [];
  for (const doc of includedDocs) {
    const filePath = path.join(docsDir, doc.filename);
    const buf = fs.readFileSync(filePath);
    const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    loadedDocs.push({
      ...doc,
      docInstance: srcDoc,
      pageCount: srcDoc.getPageCount(),
    });
  }

  loadedDocs.forEach((doc, idx) => {
    const isEven = idx % 2 === 0;
    coverPage.drawRectangle({
      x: 40,
      y: curY - 4,
      width: width - 80,
      height: 20,
      color: isEven ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
    });

    coverPage.drawText(`${doc.order}`, { x: 50, y: curY + 2, size: 8.5, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText(doc.title.slice(0, 32), { x: 80, y: curY + 2, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    coverPage.drawText(doc.filename.slice(0, 30), { x: 260, y: curY + 2, size: 8, font: helvetica, color: rgb(0.25, 0.3, 0.4) });
    coverPage.drawText(`${doc.pageCount}`, { x: 445, y: curY + 2, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    coverPage.drawText('Verified OK', { x: 495, y: curY + 2, size: 8, font: helveticaBold, color: rgb(0.08, 0.55, 0.25) });

    curY -= 20;
  });

  // 2. INDEX / TABLE OF CONTENTS (Page 2)
  const indexPage = masterDoc.addPage([595.28, 841.89]);
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

  let runningPageNumber = 3; // First document starts on page 3 (after cover & index)
  const startPages = [];

  // Append pages
  for (const doc of loadedDocs) {
    startPages.push({ doc, startPage: runningPageNumber });
    const pageIndices = doc.docInstance.getPageIndices();
    const copiedPages = await masterDoc.copyPages(doc.docInstance, pageIndices);
    for (const p of copiedPages) {
      masterDoc.addPage(p);
      runningPageNumber++;
    }
  }

  // Draw Index rows on page 2
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

  startPages.forEach(({ doc, startPage }, i) => {
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

    indexPage.drawText(`${doc.order}`, { x: 55, y: idxY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText(doc.title, { x: 100, y: idxY + 3, size: 9, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    indexPage.drawText(`${doc.pageCount} pages`, { x: 370, y: idxY + 3, size: 9, font: helvetica, color: rgb(0.3, 0.35, 0.45) });
    indexPage.drawText(`Page ${startPage}`, { x: 475, y: idxY + 3, size: 9, font: helveticaBold, color: rgb(0.1, 0.35, 0.75) });

    idxY -= 22;
  });

  // 3. RUNNING FOOTER ON EVERY PAGE (<tender_id> | Page X of Y)
  const totalPages = masterDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = masterDoc.getPage(i);
    const pWidth = page.getWidth();

    const footerText = `${tender.tender_id}  |  Page ${i + 1} of ${totalPages}`;
    const textWidth = helvetica.widthOfTextAtSize(footerText, 8.5);

    page.drawLine({
      start: { x: 35, y: 30 },
      end: { x: pWidth - 35, y: 30 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    page.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 18,
      size: 8.5,
      font: helvetica,
      color: rgb(0.35, 0.4, 0.45),
    });
  }

  const outputBytes = await masterDoc.save();
  const outPath = path.join('output', `${tender.tender_id}_Package.pdf`);
  fs.writeFileSync(outPath, outputBytes);
  console.log(`Successfully generated master package: ${outPath} (${outputBytes.length} bytes, ${totalPages} pages)`);
}

generateSamplePackage();
