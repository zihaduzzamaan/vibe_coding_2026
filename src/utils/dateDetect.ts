/**
 * Finds an expiry date in document text by looking only right after expiry-related
 * keywords ("expiry", "valid until", "validity", "মেয়াদ" ...). Never guesses from
 * unrelated dates. The result is shown to the user as a suggestion, not applied.
 */

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

const KEYWORD_RE = /(expir\w*|valid\s+(?:until|till|up\s*to|through|thru)|validity|মেয়াদ)/giu;

// Each pattern returns [year, month, day] from its match.
const DATE_PATTERNS: { re: RegExp; ymd: (m: RegExpExecArray) => [number, number, number] | null }[] = [
  { // 2027-06-30, 2027/06/30, 2027.06.30
    re: /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g,
    ymd: m => [+m[1], +m[2], +m[3]],
  },
  { // 30/06/2027, 30-06-2027 (day-first, as used in Bangladesh; swaps if clearly month-first)
    re: /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/g,
    ymd: m => (+m[2] > 12 ? [+m[3], +m[1], +m[2]] : [+m[3], +m[2], +m[1]]),
  },
  { // 30 June 2027, 30th June, 2027
    re: /\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})\b/gi,
    ymd: m => {
      const mo = MONTHS[m[2].toLowerCase().slice(0, 4)] ?? MONTHS[m[2].toLowerCase().slice(0, 3)];
      return mo ? [+m[3], mo, +m[1]] : null;
    },
  },
  { // June 30, 2027
    re: /\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/gi,
    ymd: m => {
      const mo = MONTHS[m[1].toLowerCase().slice(0, 4)] ?? MONTHS[m[1].toLowerCase().slice(0, 3)];
      return mo ? [+m[3], mo, +m[2]] : null;
    },
  },
];

function toIso([y, m, d]: [number, number, number]): string | null {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null; // rejects 31 June etc.
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function datesIn(windowText: string): string[] {
  const found: string[] = [];
  for (const { re, ymd } of DATE_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(windowText))) {
      const parts = ymd(m);
      const iso = parts && toIso(parts);
      if (iso) found.push(iso);
    }
  }
  return found;
}

export function findExpiryDate(text: string): string | undefined {
  KEYWORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = KEYWORD_RE.exec(text))) {
    // Short window after the keyword; for ranges ("valid 2026-07-01 to 2027-06-30") the later date is the expiry.
    const dates = datesIn(text.slice(m.index, m.index + 90));
    if (dates.length) return dates.sort().at(-1);
  }
  return undefined;
}
