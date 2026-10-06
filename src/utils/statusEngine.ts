import { Requirement, UploadedFile, EvaluationResult, DocumentStatus } from '../types/tender';

/**
 * Strict evaluation of a requirement row against the Section 5 status rules
 */
export function evaluateRequirementStatus(
  req: Requirement,
  matchedFile: UploadedFile | undefined,
  expiryDate: string | undefined,
  submissionDeadline: string
): EvaluationResult {
  // Case 1: No file matched
  if (!matchedFile) {
    if (req.mandatory) {
      return {
        requirement: req,
        matchedFile,
        expiryDate,
        status: 'MISSING',
        isBlocking: true,
        reason: 'Required document, no file matched.',
        reason_bn: 'বাধ্যতামূলক নথি, কোনো ফাইল সংযুক্ত করা হয়নি।'
      };
    } else {
      return {
        requirement: req,
        matchedFile,
        expiryDate,
        status: 'NOT_PROVIDED',
        isBlocking: false,
        reason: 'Optional document, no file matched.',
        reason_bn: 'ঐচ্ছিক নথি, প্রদান করা হয়নি।'
      };
    }
  }

  // Case 2: File is matched, check expiry requirements
  if (req.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '') {
      return {
        requirement: req,
        matchedFile,
        expiryDate,
        status: 'EXPIRY_DATE_NEEDED',
        isBlocking: true,
        reason: 'Document has an expiration date, but none was entered.',
        reason_bn: 'নথিটির মেয়াদ উত্তীর্ণের তারিখ আবশ্যক, যা প্রদান করা হয়নি।'
      };
    }

    // Compare date strings (ISO format YYYY-MM-DD compares lexicographically)
    const normExpiry = expiryDate.trim();
    const normDeadline = submissionDeadline.trim();

    if (normExpiry < normDeadline) {
      return {
        requirement: req,
        matchedFile,
        expiryDate: normExpiry,
        status: 'EXPIRED',
        isBlocking: true,
        reason: `Expired on ${normExpiry}. Tender deadline is ${normDeadline}.`,
        reason_bn: `মেয়াদ ${normExpiry} তারিখে শেষ হয়েছে। দরপত্রের শেষ সময় ${normDeadline}।`
      };
    }
  }

  // Case 3: Compliant and valid
  return {
    requirement: req,
    matchedFile,
    expiryDate: req.has_expiry ? expiryDate : undefined,
    status: 'OK',
    isBlocking: false,
    reason: 'Document verified and compliant.',
    reason_bn: 'নথি যাচাইকৃত ও গ্রহণযোগ্য।'
  };
}
