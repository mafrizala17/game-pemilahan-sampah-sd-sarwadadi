import React, { useEffect } from 'react';
import { LevelConfig, PlayerProgress } from '../types';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface LevelRecapModalProps {
  isOpen: boolean;
  level: LevelConfig;
  progress: PlayerProgress;
  onProceedToQuiz: () => void;
}

export const LevelRecapModal: React.FC<LevelRecapModalProps> = ({
  isOpen,
  level,
  progress,
  onProceedToQuiz
}) => {
  // Gamepad listener for recap
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let prevA = false;
    let prevStart = false;

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected) {
        if ((gp.buttons.a && !prevA) || (gp.buttons.start && !prevStart)) {
          soundManager.playClick();
          onProceedToQuiz();
        }
      }
      prevA = gp.buttons.a;
      prevStart = gp.buttons.start;
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, onProceedToQuiz]);

  // Keyboard shortcut
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'KeyE') {
        soundManager.playClick();
        onProceedToQuiz();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onProceedToQuiz]);

  if (!isOpen) return null;

  const totalSorted = progress.benar_count + progress.salah_count;
  const accuracy =
    totalSorted > 0 ? Math.round((progress.benar_count / totalSorted) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col overflow-y-auto animate-in zoom-in-95">
        {/* Banner Title */}
        <div className="text-center pb-4 border-b-2 border-[#3d4d3f] mb-4">
          <div className="text-3xl mb-1 animate-bounce">⏱️🔔</div>
          <h2 className="text-base sm:text-lg font-pixel text-yellow-400">
            WAKTU HABIS!
          </h2>
          <p className="text-xs text-slate-300 font-pixel mt-1">
            REKAP HASIL {level.nama_level.toUpperCase()}
          </p>
        </div>

        {/* Recap Grid */}
        <div className="space-y-3 mb-6 text-xs font-pixel">
          {/* Total Koin Level */}
          <div className="p-3 bg-[#1c261e] rounded-lg border-2 border-yellow-500/40 flex items-center justify-between">
            <span className="text-yellow-300 flex items-center gap-2">
              <span>🪙</span> TOTAL KOIN LEVEL
            </span>
            <span className="text-base text-yellow-400 font-bold">
              +{progress.total_koin_level}
            </span>
          </div>

          {/* Breakdown Items */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-[#162017] rounded border border-emerald-500/40 text-center">
              <span className="text-lg">🍃</span>
              <div className="text-[10px] text-emerald-300 mt-1">Organik</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {progress.sampah_organik}
              </div>
            </div>

            <div className="p-2.5 bg-[#162017] rounded border border-amber-500/40 text-center">
              <span className="text-lg">📦</span>
              <div className="text-[10px] text-amber-300 mt-1">Anorganik</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">
                {progress.sampah_anorganik}
              </div>
            </div>

            <div className="p-2.5 bg-[#162017] rounded border border-rose-500/40 text-center">
              <span className="text-lg">☣️</span>
              <div className="text-[10px] text-rose-300 mt-1">B3</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5">
                {progress.sampah_b3}
              </div>
            </div>
          </div>

          {/* Accuracy & Correct/Incorrect */}
          <div className="p-3 bg-[#162017] rounded border border-[#3d4d3f] space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-300 font-sans">
              <span>Ketepatan Pemilahan:</span>
              <span className="font-pixel font-bold text-emerald-400">{accuracy}%</span>
            </div>
            <div className="flex justify-between text-slate-400 font-sans text-[11px]">
              <span>Pilah Benar:</span>
              <span className="text-emerald-400 font-pixel">{progress.benar_count} item</span>
            </div>
            <div className="flex justify-between text-slate-400 font-sans text-[11px]">
              <span>Pilah Kurang Tepat:</span>
              <span className="text-rose-400 font-pixel">{progress.salah_count} item</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onProceedToQuiz();
            }}
            className="w-full py-4 pixel-btn pixel-btn-green rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
          >
            <span>📝</span>
            <span>LANJUT KE KUIS CHECKPOINT 3R</span>
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">[A / ✕ / START]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
