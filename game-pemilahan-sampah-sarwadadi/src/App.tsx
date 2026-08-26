/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, GameStats, LevelConfig, PlayerProgress } from './types';
import { LEVELS } from './data/gameData';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameplayScreen } from './components/GameplayScreen';
import { FinalResultScreen } from './components/FinalResultScreen';
import { PetunjukModal } from './components/PetunjukModal';
import { Materi3RModal } from './components/Materi3RModal';
import { soundManager } from './utils/audio';
import { leaderboardManager } from './utils/leaderboardManager';

export type ScreenState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'GAMEPLAY' | 'FINAL_RESULT';

export default function App() {
  // 1. Persistent Player Profile State
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('sarwadadi_player');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore fallback
      }
    }
    return {
      player_id: 1,
      nama: 'Budi Santoso',
      kelas: '5 SD',
      sekolah: 'SD Negeri Sarwadadi',
      jenis_kelamin: 'L',
      tanggal_daftar: new Date().toISOString()
    };
  });

  // 2. Persistent Game Stats & Level Progression
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('sarwadadi_game_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      total_koin: 0,
      total_sampah_terkumpul: 0,
      total_organik: 0,
      total_anorganik: 0,
      total_b3: 0,
      total_benar: 0,
      total_salah: 0,
      current_level: 1,
      unlocked_levels: [1],
      level_progress: {}
    };
  });

  // Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('MAIN_MENU');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(LEVELS[0]);

  // Global Modals State
  const [isPetunjukOpen, setIsPetunjukOpen] = useState(false);
  const [isMateriOpen, setIsMateriOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted());

  // Save Player to LocalStorage
  const handleUpdatePlayer = (updated: Player) => {
    setPlayer(updated);
    localStorage.setItem('sarwadadi_player', JSON.stringify(updated));
  };

  // Save Stats to LocalStorage
  useEffect(() => {
    localStorage.setItem('sarwadadi_game_stats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Toggle Mute
  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Start Game -> Go to Level Select
  const handleStartGame = () => {
    setCurrentScreen('LEVEL_SELECT');
  };

  // Select Level -> Start Gameplay
  const handleSelectLevel = (level: LevelConfig) => {
    setActiveLevel(level);
    setCurrentScreen('GAMEPLAY');
  };

  // Finish Level & Record Progress & Update Leaderboard
  const handleFinishLevel = (progress: PlayerProgress) => {
    setGameStats((prev) => {
      const nextUnlocked = [...prev.unlocked_levels];
      const nextLevelId = progress.level_id + 1;
      if (nextLevelId <= 3 && !nextUnlocked.includes(nextLevelId)) {
        nextUnlocked.push(nextLevelId);
      }

      const existingProgress = prev.level_progress[progress.level_id];
      const bestScore = Math.max(existingProgress?.high_score || 0, progress.total_koin_level);
      const newTotalCoins = prev.total_koin + progress.total_koin_level;
      const totalSorted = prev.total_benar + progress.benar_count;
      const totalTried = totalSorted + prev.total_salah + progress.salah_count;
      const acc = totalTried > 0 ? Math.round((totalSorted / totalTried) * 100) : 95;

      // Update in Leaderboard storage
      leaderboardManager.addOrUpdateScore({
        nama: player.nama,
        kelas: player.kelas,
        sekolah: player.sekolah,
        total_koin: newTotalCoins,
        sampah_dipilah: totalSorted,
        akurasi: acc,
        level_tertinggi: Math.max(...nextUnlocked)
      });

      return {
        ...prev,
        total_koin: newTotalCoins,
        total_sampah_terkumpul: prev.total_sampah_terkumpul + progress.benar_count + progress.salah_count,
        total_organik: prev.total_organik + progress.sampah_organik,
        total_anorganik: prev.total_anorganik + progress.sampah_anorganik,
        total_b3: prev.total_b3 + progress.sampah_b3,
        total_benar: prev.total_benar + progress.benar_count,
        total_salah: prev.total_salah + progress.salah_count,
        unlocked_levels: nextUnlocked,
        level_progress: {
          ...prev.level_progress,
          [progress.level_id]: {
            ...progress,
            high_score: bestScore
          }
        }
      };
    });
  };

  // Advance to next level or show final result if Level 3
  const handleAdvanceNextLevel = (fromLevelId?: number) => {
    const currentId = fromLevelId ?? activeLevel.level_id;
    if (currentId >= 3) {
      setCurrentScreen('FINAL_RESULT');
    } else {
      const nextLvl = LEVELS.find((l) => l.level_id === currentId + 1);
      if (nextLvl) {
        setActiveLevel(nextLvl);
        setCurrentScreen('GAMEPLAY');
      } else {
        setCurrentScreen('LEVEL_SELECT');
      }
    }
  };

  // Replay from beginning
  const handlePlayAgain = () => {
    setActiveLevel(LEVELS[0]);
    setCurrentScreen('GAMEPLAY');
  };

  return (
    <div className="min-h-screen bg-[#141a15] bg-radial from-[#1e2a20] to-[#121713] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-emerald-950">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-4 px-2 sm:px-4">
        {currentScreen === 'MAIN_MENU' && (
          <MainMenu
            player={player}
            gameStats={gameStats}
            onUpdatePlayer={handleUpdatePlayer}
            onStartGame={handleStartGame}
            onOpenPetunjuk={() => setIsPetunjukOpen(true)}
            onOpenMateri={() => setIsMateriOpen(true)}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />
        )}

        {currentScreen === 'LEVEL_SELECT' && (
          <LevelSelect
            unlockedLevels={gameStats.unlocked_levels}
            gameStats={gameStats}
            onSelectLevel={handleSelectLevel}
            onBackToMenu={() => setCurrentScreen('MAIN_MENU')}
            onOpenMateri={() => setIsMateriOpen(true)}
          />
        )}

        {currentScreen === 'GAMEPLAY' && (
          <GameplayScreen
            key={`gameplay_level_${activeLevel.level_id}`}
            level={activeLevel}
            player={player}
            onFinishLevel={handleFinishLevel}
            onExitToMenu={() => setCurrentScreen('MAIN_MENU')}
            onOpenMateri={() => setIsMateriOpen(true)}
            onAdvanceNextLevel={handleAdvanceNextLevel}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />
        )}

        {currentScreen === 'FINAL_RESULT' && (
          <FinalResultScreen
            player={player}
            gameStats={gameStats}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={() => setCurrentScreen('MAIN_MENU')}
          />
        )}
      </main>

      {/* Global Petunjuk Modal */}
      <PetunjukModal
        isOpen={isPetunjukOpen}
        onClose={() => setIsPetunjukOpen(false)}
      />

      {/* Global Materi 3R Modal */}
      <Materi3RModal
        isOpen={isMateriOpen}
        onClose={() => setIsMateriOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[10px] text-slate-500 font-pixel border-t border-[#1e2a20] bg-[#0f1410]/80">
        © 2026 Edukasi Pemilahan Sampah & TPS 3R Desa Sarwadadi • Kurikulum Merdeka Ekonomi Sirkular
      </footer>
    </div>
  );
}
