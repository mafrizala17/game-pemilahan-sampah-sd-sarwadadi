import { LeaderboardEntry } from '../types';
import { DEFAULT_LEADERBOARD } from '../data/gameData';

const LEADERBOARD_KEY = 'sarwadadi_leaderboard';

export const leaderboardManager = {
  getEntries(): LeaderboardEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Only default to initial sample on very first first run if key doesn't exist
    this.saveEntries(DEFAULT_LEADERBOARD);
    return DEFAULT_LEADERBOARD;
  },

  saveEntries(entries: LeaderboardEntry[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  },

  addOrUpdateScore(entry: Omit<LeaderboardEntry, 'id' | 'tanggal'>): LeaderboardEntry[] {
    const current = this.getEntries();
    const existingIndex = current.findIndex(
      (e) => e.nama.trim().toLowerCase() === entry.nama.trim().toLowerCase()
    );

    let updatedList: LeaderboardEntry[];
    const now = new Date();
    const timeStr = `${now.getDate()}/${now.getMonth() + 1} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (existingIndex !== -1) {
      const existing = current[existingIndex];
      // Update if current score is higher or equal
      if (entry.total_koin >= existing.total_koin) {
        current[existingIndex] = {
          ...existing,
          ...entry,
          tanggal: 'Baru saja'
        };
      }
      updatedList = [...current];
    } else {
      const newEntry: LeaderboardEntry = {
        id: `lead-${Date.now()}`,
        ...entry,
        tanggal: 'Baru saja'
      };
      updatedList = [newEntry, ...current];
    }

    // Sort by total_koin descending, then accuracy descending
    updatedList.sort((a, b) => {
      if (b.total_koin !== a.total_koin) return b.total_koin - a.total_koin;
      return b.akurasi - a.akurasi;
    });

    // Keep top 20
    const trimmed = updatedList.slice(0, 20);
    this.saveEntries(trimmed);
    return trimmed;
  },

  clearLeaderboard(): LeaderboardEntry[] {
    this.saveEntries([]);
    return [];
  },

  resetToDefault(): LeaderboardEntry[] {
    this.saveEntries(DEFAULT_LEADERBOARD);
    return DEFAULT_LEADERBOARD;
  },

  resetLeaderboard(): LeaderboardEntry[] {
    return this.clearLeaderboard();
  }
};

