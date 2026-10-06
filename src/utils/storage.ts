import { MatchedItem } from '../types/tender';

const STORAGE_KEY = 'tender_builder_matches_v1';

export function saveMatchesToStorage(matches: Record<string, { fileId?: string; expiryDate?: string }>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function loadMatchesFromStorage(): Record<string, { fileId?: string; expiryDate?: string }> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read from localStorage', err);
  }
  return null;
}

export function clearMatchesFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}
