import { TenderMetadata, EvaluationResult } from '../types/tender';

/**
 * Generates and triggers download of the compliance checklist as a CSV spreadsheet
 */
export function exportChecklistCsv(tender: TenderMetadata, items: EvaluationResult[]): void {
  const headers = ['Order', 'Requirement ID', 'Requirement (EN)', 'Requirement (BN)', 'Mandatory', 'Matched File', 'Pages', 'Expiry Date', 'Status', 'Verification Reason'];
  
  const rows = items.map(item => [
    item.requirement.order,
    item.requirement.id,
    `"${item.requirement.title_en.replace(/"/g, '""')}"`,
    `"${item.requirement.title_bn.replace(/"/g, '""')}"`,
    item.requirement.mandatory ? 'YES' : 'NO',
    `"${(item.matchedFile?.name || 'N/A').replace(/"/g, '""')}"`,
    item.matchedFile?.pageCount || 0,
    item.expiryDate || 'N/A',
    item.status,
    `"${item.reason.replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    `# Tender: ${tender.tender_id} - ${tender.title}`,
    `# Bidder: ${tender.bidder}`,
    `# Submission Deadline: ${tender.submission_deadline}`,
    `# Export Date: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tender.tender_id}_Compliance_Checklist.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
