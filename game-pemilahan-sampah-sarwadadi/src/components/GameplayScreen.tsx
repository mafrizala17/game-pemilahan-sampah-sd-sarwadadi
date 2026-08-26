import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelConfig, Player, TrashItem, CollectionDetail, PlayerProgress, WasteCategory } from '../types';
import { GameCanvas } from './GameCanvas';
import { SortingModal } from './SortingModal';
import { LevelRecapModal } from './LevelRecapModal';
import { QuizCheckpointModal } from './QuizCheckpointModal';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface GameplayScreenProps {
  level: LevelConfig;
  player: Player;
  onFinishLevel: (progress: PlayerProgress) => void;
  onExitToMenu: () => void;
  onOpenMateri: () => void;
  onAdvanceNextLevel: (fromLevelId?: number) => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  player,
  onFinishLevel,
  onExitToMenu,
  onOpenMateri,
  onAdvanceNextLevel,
  isMuted,
  onToggleSound
}) => {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(level.waktu_detik);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Gameplay State
  const [inventory, setInventory] = useState<TrashItem[]>([]);
  const [levelCoins, setLevelCoins] = useState(0);
  const [sortedOrganik, setSortedOrganik] = useState(0);
  const [sortedAnorganik, setSortedAnorganik] = useState(0);
  const [sortedB3, setSortedB3] = useState(0);
  const [benarCount, setBenarCount] = useState(0);
  const [salahCount, setSalahCount] = useState(0);

  // Modals
  const [isSortingOpen, setIsSortingOpen] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Max inventory limit (up to 5 items in backpack)
  const MAX_INVENTORY = 5;

  // Initialize or reset level on mount / level change
  useEffect(() => {
    setTimeLeft(level.waktu_detik);
    setIsPaused(false);
    setIsTimeUp(false);
    setInventory([]);
    setLevelCoins(0);
    setSortedOrganik(0);
    setSortedAnorganik(0);
    setSortedB3(0);
    setBenarCount(0);
    setSalahCount(0);
    setIsSortingOpen(false);
    setShowRecapModal(false);
    setShowQuizModal(false);
  }, [level]);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (isPaused || isTimeUp || showRecapModal || showQuizModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          setIsSortingOpen(false);
          soundManager.playCountdownBeep(true);
          setShowRecapModal(true);
          return 0;
        }

        // Play warning beep when <= 5 seconds
        if (prev <= 5) {
          soundManager.playCountdownBeep(false);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isTimeUp, showRecapModal, showQuizModal]);

  // Refs for stable polling without tearing down effect on state changes
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const showRecapModalRef = useRef(showRecapModal);
  showRecapModalRef.current = showRecapModal;
  const showQuizModalRef = useRef(showQuizModal);
  showQuizModalRef.current = showQuizModal;
  const isSortingOpenRef = useRef(isSortingOpen);
  isSortingOpenRef.current = isSortingOpen;
  const lastPauseToggleTimeRef = useRef(0);

  // Gamepad listener for Pause / Start controls
  useEffect(() => {
    let animId: number;
    let prevButtons = {
      start: false,
      back: false,
      a: false,
      b: false,
      x: false,
      y: false
    };

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected) {
        const now = Date.now();
        const startJustPressed = (gp.buttons.start && !prevButtons.start) || (gp.buttons.back && !prevButtons.back);

        if (startJustPressed && now - lastPauseToggleTimeRef.current > 300) {
          if (!showRecapModalRef.current && !showQuizModalRef.current && !isSortingOpenRef.current) {
            lastPauseToggleTimeRef.current = now;
            soundManager.playClick();
            setIsPaused((prev) => !prev);
          }
        } else if (isPausedRef.current) {
          if ((gp.buttons.a && !prevButtons.a) || (gp.buttons.start && !prevButtons.start && now - lastPauseToggleTimeRef.current > 300)) {
            lastPauseToggleTimeRef.current = now;
            soundManager.playClick();
            setIsPaused(false);
          } else if (gp.buttons.x && !prevButtons.x) {
            soundManager.playClick();
            onOpenMateri();
          } else if ((gp.buttons.y && !prevButtons.y) || (gp.buttons.b && !prevButtons.b)) {
            soundManager.playClick();
            onExitToMenu();
          }
        }

        prevButtons = {
          start: gp.buttons.start,
          back: gp.buttons.back,
          a: gp.buttons.a,
          b: gp.buttons.b,
          x: gp.buttons.x,
          y: gp.buttons.y
        };
      }

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [onOpenMateri, onExitToMenu]);

  // Keyboard shortcut for Pause (ESC / P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P' || e.code === 'Pause') {
        const now = Date.now();
        if (now - lastPauseToggleTimeRef.current > 300) {
          if (!showRecapModalRef.current && !showQuizModalRef.current && !isSortingOpenRef.current) {
            lastPauseToggleTimeRef.current = now;
            soundManager.playClick();
            setIsPaused((prev) => !prev);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep a stable ref of inventory length for synchronous checking
  const inventoryRef = useRef<TrashItem[]>(inventory);
  inventoryRef.current = inventory;

  // Pickup trash handler - bulletproof synchronous check
  const handlePickupTrash = useCallback(
    (item: TrashItem): boolean => {
      if (inventoryRef.current.length >= MAX_INVENTORY) {
        return false;
      }
      setInventory((prev) => {
        if (prev.length >= MAX_INVENTORY) return prev;
        return [...prev, { ...item }];
      });
      return true;
    },
    []
  );

  // Sort trash item at TPS 3R station
  const handleSortItem = useCallback(
    (item: TrashItem, selectedCategory: WasteCategory) => {
      const isCorrect = item.kategori_id === selectedCategory;
      const coinEarned = isCorrect ? item.nilai_koin : 0;

      if (isCorrect) {
        setLevelCoins((prev) => prev + coinEarned);
        setBenarCount((prev) => prev + 1);

        if (selectedCategory === 'Organik') {
          setSortedOrganik((prev) => prev + 1);
        } else if (selectedCategory === 'Anorganik') {
          setSortedAnorganik((prev) => prev + 1);
        } else if (selectedCategory === 'B3') {
          setSortedB3((prev) => prev + 1);
        }
      } else {
        setSalahCount((prev) => prev + 1);
      }

      // Instantly and reliably remove the sorted item from inventory
      setInventory((prev) => {
        const idx = prev.findIndex(
          (i) => i.trash_item_id === item.trash_item_id
        );
        if (idx !== -1) {
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        }
        // Fallback remove first item if not found
        return prev.slice(1);
      });

      return { isCorrect, coinEarned };
    },
    []
  );

  // Handle Proceed from Recap to Quiz
  const handleProceedToQuiz = () => {
    setShowRecapModal(false);
    setShowQuizModal(true);
  };

  // Handle Quiz Passed - Advance explicitly with current level ID
  const handleQuizPassed = () => {
    setShowQuizModal(false);
    setShowRecapModal(false);
    setIsTimeUp(false);
    setIsPaused(false);

    const progress: PlayerProgress = {
      player_id: player.player_id,
      level_id: level.level_id,
      total_koin_level: levelCoins,
      sampah_organik: sortedOrganik,
      sampah_anorganik: sortedAnorganik,
      sampah_b3: sortedB3,
      benar_count: benarCount,
      salah_count: salahCount,
      is_level_completed: true,
      quiz_passed: true,
      high_score: levelCoins
    };

    onFinishLevel(progress);
    onAdvanceNextLevel(level.level_id);
  };

  // Retry level
  const handleRetryLevel = () => {
    setShowQuizModal(false);
    setShowRecapModal(false);
    setIsSortingOpen(false);
    setTimeLeft(level.waktu_detik);
    setIsTimeUp(false);
    setIsPaused(false);
    setInventory([]);
    setLevelCoins(0);
    setSortedOrganik(0);
    setSortedAnorganik(0);
    setSortedB3(0);
    setBenarCount(0);
    setSalahCount(0);
  };

  // Current progress object for modal
  const currentProgress: PlayerProgress = {
    player_id: player.player_id,
    level_id: level.level_id,
    total_koin_level: levelCoins,
    sampah_organik: sortedOrganik,
    sampah_anorganik: sortedAnorganik,
    sampah_b3: sortedB3,
    benar_count: benarCount,
    salah_count: salahCount,
    is_level_completed: true,
    quiz_passed: false,
    high_score: levelCoins
  };

  // Timer color indicator
  const timerRatio = timeLeft / level.waktu_detik;
  const timerBgColor =
    timerRatio > 0.5
      ? 'bg-emerald-500'
      : timerRatio > 0.25
      ? 'bg-amber-500'
      : 'bg-rose-600 animate-pulse';

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col items-center select-none">
      {/* Top HUD Bar */}
      <div className="w-full pixel-box rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 text-slate-100 border-2 border-[#2b3a2e]">
        {/* Left: Location & Level & Pause Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsPaused(!isPaused);
            }}
            className="pixel-btn pixel-btn-gray px-2.5 py-1.5 rounded text-xs font-pixel flex items-center gap-1.5"
            title="Jeda Game [START / ESC / P]"
          >
            <span>{isPaused ? '▶' : '⏸'}</span>
            <span>{isPaused ? 'LANJUT' : 'JEDA'}</span>
            <span className="hidden sm:inline text-[9px] bg-black/40 px-1 py-0.5 rounded text-slate-300">
              START
            </span>
          </button>
          <div>
            <div className="font-pixel text-[10px] sm:text-xs text-yellow-300 flex items-center gap-1.5">
              <span>📍</span> {level.nama_lokasi}
            </div>
            <div className="text-[10px] text-slate-400 font-pixel">
              Level {level.level_id} • {player.nama}
            </div>
          </div>
        </div>

        {/* Center: Urgency Timer */}
        <div className="flex-1 min-w-[140px] max-w-xs flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[10px] font-pixel mb-1">
            <span className="text-slate-400">⏱️ SISA WAKTU:</span>
            <span
              className={`font-bold ${
                timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-yellow-400'
              }`}
            >
              {timeLeft} DETIK
            </span>
          </div>
          <div className="w-full h-3 bg-[#141a15] rounded-full border border-[#3e4f40] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${timerBgColor}`}
              style={{ width: `${Math.max(0, timerRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Right: Coin Counter & Carried Inventory */}
        <div className="flex items-center gap-3">
          {/* Inventory Count */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#172218] rounded border border-emerald-500/40 text-xs font-pixel cursor-pointer"
            onClick={() => {
              if (inventory.length > 0) {
                soundManager.playClick();
                setIsSortingOpen(true);
              }
            }}
            title="Barang di Tas"
          >
            <span>🎒</span>
            <span className="text-emerald-300">
              {inventory.length}/{MAX_INVENTORY}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#241f0f] rounded border border-yellow-500/50 text-xs font-pixel">
            <span className="text-amber-400 text-sm">🪙</span>
            <span className="text-yellow-300 font-bold">+{levelCoins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className="pixel-btn pixel-btn-gray p-1.5 rounded text-xs"
            title="Toggle Suara"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Backpack Inventory Tray Preview (Items carried) */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="font-pixel text-[10px] text-slate-400 shrink-0">
            TAS SEMENTARA:
          </span>
          {inventory.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic">
              (Belum ada sampah. Dekati sampah lalu tekan Ambil / A / Spasi!)
            </span>
          ) : (
            inventory.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e2a20] border border-[#3e5241] text-[11px] text-slate-200"
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.nama_sampah}</span>
              </span>
            ))
          )}
        </div>

        {inventory.length > 0 && (
          <button
            onClick={() => {
              soundManager.playClick();
              setIsSortingOpen(true);
            }}
            className="text-[10px] font-pixel text-yellow-400 underline shrink-0 hover:text-yellow-300 flex items-center gap-1"
          >
            <span>Buka TPS 3R</span>
            <span className="bg-yellow-950 px-1 py-0.2 rounded border border-yellow-500/50 text-[9px]">
              [X]
            </span>
          </button>
        )}
      </div>

      {/* Main 2D Pixel Canvas */}
      <GameCanvas
        level={level}
        player={player}
        inventory={inventory}
        onPickupTrash={handlePickupTrash}
        onOpenTPS={() => setIsSortingOpen(true)}
        isSortingOpen={isSortingOpen}
        isPaused={isPaused || isTimeUp}
        timeRemaining={timeLeft}
      />

      {/* Pause Dialog Overlay with Gamepad shortcuts */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="pixel-box rounded-xl p-6 text-center max-w-sm w-full border-4 border-[#1e2a20] animate-in zoom-in-95">
            <div className="text-3xl mb-1">⏸️</div>
            <h3 className="font-pixel text-base text-yellow-400 mb-2">GAME DIJEDA</h3>
            <p className="text-xs text-slate-300 mb-5">
              Tarik napas sejenak, lalu lanjutkan pemilahan sampah Desa Sarwadadi!
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3.5 pixel-btn pixel-btn-green rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
              >
                <span>▶ LANJUTKAN PERMAINAN</span>
                <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-emerald-200">
                  [A / START]
                </span>
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenMateri();
                }}
                className="w-full py-2.5 pixel-btn pixel-btn-blue rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
              >
                <span>📖 BACA MATERI 3R</span>
                <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-blue-200">
                  [X / ⬜]
                </span>
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onExitToMenu();
                }}
                className="w-full py-2.5 pixel-btn pixel-btn-gray rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
              >
                <span>🏠 KEMBALI KE MENU UTAMA</span>
                <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                  [Y / 🔺 / B]
                </span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#364839] text-[10px] text-slate-400 font-pixel">
              🎮 Tekan START atau A untuk melanjutkan
            </div>
          </div>
        </div>
      )}

      {/* Sorting Modal */}
      <SortingModal
        isOpen={isSortingOpen}
        inventory={inventory}
        onClose={() => setIsSortingOpen(false)}
        onSortItem={handleSortItem}
      />

      {/* Level Recap Modal (when timer reaches 0) */}
      <LevelRecapModal
        isOpen={showRecapModal}
        level={level}
        progress={currentProgress}
        onProceedToQuiz={handleProceedToQuiz}
      />

      {/* Quiz Checkpoint Modal */}
      <QuizCheckpointModal
        isOpen={showQuizModal}
        level={level}
        onPassQuiz={handleQuizPassed}
        onOpenMateri={() => {
          setShowQuizModal(false);
          onOpenMateri();
        }}
        onRetryLevel={handleRetryLevel}
      />
    </div>
  );
};
