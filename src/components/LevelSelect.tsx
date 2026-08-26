import React, { useState, useEffect } from 'react';
import { LevelConfig, GameStats } from '../types';
import { LEVELS } from '../data/gameData';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';
import { QuizCheckpointModal } from './QuizCheckpointModal';

interface LevelSelectProps {
  unlockedLevels: number[];
  gameStats: GameStats;
  onSelectLevel: (level: LevelConfig) => void;
  onBackToMenu: () => void;
  onOpenMateri: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  unlockedLevels,
  gameStats,
  onSelectLevel,
  onBackToMenu,
  onOpenMateri
}) => {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const [practiceQuizLevel, setPracticeQuizLevel] = useState<LevelConfig | null>(null);

  // Gamepad navigation loop
  useEffect(() => {
    let animId: number;
    let prevLeft = false;
    let prevRight = false;
    let prevA = false;
    let prevB = false;
    let prevX = false;
    let prevStart = false;

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected && !practiceQuizLevel) {
        // D-Pad Left
        if ((gp.buttons.dpadLeft || gp.axes.x < -0.5) && !prevLeft) {
          soundManager.playClick();
          setSelectedLevelIdx((prev) => Math.max(0, prev - 1));
        }
        // D-Pad Right
        else if ((gp.buttons.dpadRight || gp.axes.x > 0.5) && !prevRight) {
          soundManager.playClick();
          setSelectedLevelIdx((prev) => Math.min(LEVELS.length - 1, prev + 1));
        }
        // Button A or START -> Select Level
        else if ((gp.buttons.a && !prevA) || (gp.buttons.start && !prevStart)) {
          const targetLvl = LEVELS[selectedLevelIdx];
          if (unlockedLevels.includes(targetLvl.level_id)) {
            soundManager.playClick();
            onSelectLevel(targetLvl);
          }
        }
        // Button X -> Practice Quiz Checkpoint
        else if (gp.buttons.x && !prevX) {
          const targetLvl = LEVELS[selectedLevelIdx];
          if (unlockedLevels.includes(targetLvl.level_id)) {
            soundManager.playClick();
            setPracticeQuizLevel(targetLvl);
          }
        }
        // Button B -> Back to Menu
        else if (gp.buttons.b && !prevB) {
          soundManager.playClick();
          onBackToMenu();
        }
      }

      prevLeft = gp.buttons.dpadLeft || gp.axes.x < -0.5;
      prevRight = gp.buttons.dpadRight || gp.axes.x > 0.5;
      prevA = gp.buttons.a;
      prevB = gp.buttons.b;
      prevX = gp.buttons.x;
      prevStart = gp.buttons.start;

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [selectedLevelIdx, unlockedLevels, onSelectLevel, onBackToMenu, practiceQuizLevel]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center animate-in fade-in">
      {/* Title Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1c271e] rounded-full border border-emerald-500/40 text-[11px] font-pixel text-emerald-400 mb-2">
          <span>🗺️</span> PILIH MISI LOKASI DESA SARWADADI
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-yellow-400">
          PILIH TANTANGAN LEVEL & KUIS
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
          Selesaikan misi pemilahan dan kuis checkpoint 3R di setiap lokasi untuk membuka area berikutnya!
        </p>
      </div>

      {/* Level Cards Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {LEVELS.map((lvl, idx) => {
          const isUnlocked = unlockedLevels.includes(lvl.level_id);
          const progress = gameStats.level_progress[lvl.level_id];
          const isCompleted = progress?.is_level_completed;
          const highScore = progress?.high_score || 0;
          const isFocused = idx === selectedLevelIdx;

          return (
            <div
              key={lvl.level_id}
              className={`pixel-box rounded-xl p-5 flex flex-col justify-between transition-all ${
                isFocused ? 'ring-2 ring-yellow-400 -translate-y-1' : ''
              } ${
                isUnlocked
                  ? 'hover:-translate-y-1 hover:border-yellow-400 cursor-pointer'
                  : 'opacity-65 grayscale'
              }`}
              onClick={() => {
                setSelectedLevelIdx(idx);
                if (isUnlocked) {
                  soundManager.playClick();
                  onSelectLevel(lvl);
                }
              }}
            >
              <div>
                {/* Level Tag & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] bg-[#141a15] px-2.5 py-1 rounded text-yellow-300 border border-yellow-500/30">
                    LEVEL {lvl.level_id}
                  </span>
                  {isCompleted ? (
                    <span className="font-pixel text-[9px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400">
                      ✓ SELESAI
                    </span>
                  ) : !isUnlocked ? (
                    <span className="font-pixel text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600">
                      🔒 TERKUNCI
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-amber-900 text-amber-300 px-2 py-0.5 rounded border border-amber-400">
                      ★ TERBUKA
                    </span>
                  )}
                </div>

                {/* Location Title */}
                <h3 className="font-pixel text-sm text-slate-100 mb-1 leading-snug">
                  {lvl.nama_lokasi}
                </h3>
                <p className="text-[11px] text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                  {lvl.deskripsi}
                </p>

                {/* Info Pills */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between p-2 bg-[#1b241c] rounded border border-[#354637]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>⏱️</span> Batas Waktu:
                    </span>
                    <span className="font-pixel text-yellow-400 font-bold">
                      {lvl.waktu_detik} Detik
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#1b241c] rounded border border-[#354637]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>🗑️</span> Jenis Sampah:
                    </span>
                    <div className="flex gap-1">
                      <span className="text-xs" title="Organik">🍃</span>
                      <span className="text-xs" title="Anorganik">📦</span>
                      {lvl.allowed_categories.includes('B3') && (
                        <span className="text-xs text-rose-400" title="B3">☣️</span>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center justify-between p-2 bg-emerald-950/40 rounded border border-emerald-600/40">
                      <span className="text-emerald-300 text-[11px]">Skor Tertinggi:</span>
                      <span className="font-pixel text-yellow-400 text-[11px]">
                        {highScore} Koin
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  disabled={!isUnlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUnlocked) {
                      soundManager.playClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  className={`w-full py-3 pixel-btn rounded-lg font-pixel text-xs flex items-center justify-center gap-2 ${
                    isUnlocked ? 'pixel-btn-green' : 'pixel-btn-gray cursor-not-allowed'
                  }`}
                >
                  <span>{isUnlocked ? '▶ MULAI LEVEL' : '🔒 TERKUNCI'}</span>
                  {isUnlocked && isFocused && (
                    <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px] text-emerald-200">
                      [A / START]
                    </span>
                  )}
                </button>

                {/* Direct Quiz Checkpoint Test / Practice Button */}
                {isUnlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playClick();
                      setPracticeQuizLevel(lvl);
                    }}
                    className="w-full py-1.5 pixel-btn pixel-btn-amber rounded font-pixel text-[10px] flex items-center justify-center gap-1.5"
                    title="Uji / Latihan Kuis Checkpoint Level ini"
                  >
                    <span>🎓</span>
                    <span>KUIS CHECKPOINT LEVEL {lvl.level_id}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to Menu Button with Controller Hints */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToMenu();
          }}
          className="pixel-btn pixel-btn-gray px-6 py-2.5 rounded-lg font-pixel text-xs flex items-center gap-2"
        >
          <span>◀</span>
          <span>KEMBALI KE MENU UTAMA</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
            [B / ⭕]
          </span>
        </button>
      </div>

      {/* Standalone Quiz Practice Modal */}
      {practiceQuizLevel && (
        <QuizCheckpointModal
          isOpen={true}
          level={practiceQuizLevel}
          onPassQuiz={() => {
            setPracticeQuizLevel(null);
          }}
          onOpenMateri={() => {
            setPracticeQuizLevel(null);
            onOpenMateri();
          }}
          onRetryLevel={() => {
            const lvl = practiceQuizLevel;
            setPracticeQuizLevel(null);
            onSelectLevel(lvl);
          }}
        />
      )}
    </div>
  );
};
