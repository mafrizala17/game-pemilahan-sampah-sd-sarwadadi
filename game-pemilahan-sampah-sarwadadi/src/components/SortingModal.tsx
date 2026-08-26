import React, { useState, useEffect, useRef } from 'react';
import { TrashItem, WasteCategory, CollectionDetail } from '../types';
import { CATEGORIES } from '../data/gameData';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface SortingModalProps {
  isOpen: boolean;
  inventory: TrashItem[];
  onClose: () => void;
  onSortItem: (item: TrashItem, selectedCategory: WasteCategory) => { isCorrect: boolean; coinEarned: number };
}

export const SortingModal: React.FC<SortingModalProps> = ({
  isOpen,
  inventory,
  onClose,
  onSortItem
}) => {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    itemName: string;
    category: WasteCategory;
    correctCategory: WasteCategory;
    coins: number;
    explanation?: string;
  } | null>(null);

  // Grace period ref so pressing X to open TPS does not trigger B3 sorting immediately
  const openedAtRef = useRef<number>(0);
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  useEffect(() => {
    if (isOpen) {
      // 450ms cooldown before sorting inputs are accepted
      openedAtRef.current = Date.now() + 450;
      setFeedback(null);
    }
  }, [isOpen]);

  const currentItem = inventory[0];

  const handleSelectCategory = (category: WasteCategory) => {
    // Prevent accidental trigger during grace period or while feedback is active
    if (Date.now() < openedAtRef.current) return;
    if (!currentItem || feedbackRef.current !== null) return;

    const itemRef = currentItem;
    const result = onSortItem(itemRef, category);
    const isCorrect = result.isCorrect;

    setFeedback({
      show: true,
      isCorrect,
      itemName: itemRef.nama_sampah,
      category,
      correctCategory: itemRef.kategori_id,
      coins: result.coinEarned,
      explanation: itemRef.deskripsi
    });

    if (isCorrect) {
      soundManager.playCoin();
      gamepadManager.vibrate(140, 0.4, 0.4);
    } else {
      soundManager.playWrong();
      gamepadManager.vibrate(280, 0.8, 0.2);
    }

    // Auto-advance or close after short delay
    setTimeout(() => {
      setFeedback(null);
      // If no more items in inventory, close automatically
      if (inventoryRef.current.length <= 1) {
        onClose();
      }
    }, 1200);
  };

  // Gamepad listener inside Modal (Triangle / Y to Close, A/B/X to Sort)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    // Initialize with TRUE so existing button presses from game canvas must be released first!
    let prevButtonA = true;
    let prevButtonB = true;
    let prevButtonX = true;
    let prevButtonY = true;
    let prevBack = true;
    let firstPoll = true;

    const pollGamepad = () => {
      const gp = gamepadManager.poll();
      setGamepadConnected(gp.connected);

      if (gp.connected) {
        // On very first poll frame, absorb all currently pressed buttons
        if (firstPoll) {
          prevButtonA = gp.buttons.a;
          prevButtonB = gp.buttons.b;
          prevButtonX = gp.buttons.x;
          prevButtonY = gp.buttons.y;
          prevBack = gp.buttons.back;
          firstPoll = false;
        }

        // Button Y / Triangle / Segitiga (Tutup Tas Kapan Saja)
        if ((gp.buttons.y && !prevButtonY) || (gp.buttons.back && !prevBack)) {
          soundManager.playClick();
          onClose();
          return;
        }

        // If inventory is empty, Button B / A also closes modal
        if (inventoryRef.current.length === 0) {
          if ((gp.buttons.b && !prevButtonB) || (gp.buttons.a && !prevButtonA)) {
            soundManager.playClick();
            onClose();
            return;
          }
        }

        // Inside sorting choices (Only accept after grace period):
        if (Date.now() >= openedAtRef.current && !feedbackRef.current && inventoryRef.current[0]) {
          // Button A (Organik)
          if (gp.buttons.a && !prevButtonA) {
            handleSelectCategory('Organik');
          }
          // Button B (Anorganik)
          else if (gp.buttons.b && !prevButtonB) {
            handleSelectCategory('Anorganik');
          }
          // Button X (B3)
          else if (gp.buttons.x && !prevButtonX) {
            handleSelectCategory('B3');
          }
        }

        prevButtonA = gp.buttons.a;
        prevButtonB = gp.buttons.b;
        prevButtonX = gp.buttons.x;
        prevButtonY = gp.buttons.y;
        prevBack = gp.buttons.back;
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, onClose]);

  // Keyboard shortcut listener (1, 2, 3 for bins, Y / ESC to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'y' || e.key === 'Y' || e.key === 't' || e.key === 'T') {
        e.preventDefault();
        soundManager.playClick();
        onClose();
        return;
      }

      if (Date.now() < openedAtRef.current || feedbackRef.current || !inventoryRef.current[0]) {
        return;
      }

      if (e.key === '1' || e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        handleSelectCategory('Organik');
      } else if (e.key === '2' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleSelectCategory('Anorganik');
      } else if (e.key === '3' || e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleSelectCategory('B3');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4d3f] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-2xl sm:text-3xl shrink-0">🏛️</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm md:text-base font-pixel text-emerald-400 truncate">
                  STASIUN PEMILAHAN TPS 3R
                </h2>
                {gamepadConnected && (
                  <span className="bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500 text-[8px] sm:text-[9px] font-pixel text-emerald-300">
                    🎮 Gamepad
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Pilah sampah ke dalam wadah warna yang sesuai untuk ditukar koin!
              </p>
            </div>
          </div>

          {/* Close Button with Clear Triangle Icon */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="pixel-btn pixel-btn-amber px-2.5 py-1.5 rounded text-xs font-pixel flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
              title="Tutup Tas [▲ Segitiga / Y / ESC]"
            >
              <span className="text-base font-bold text-amber-950 leading-none">▲</span>
              <span className="hidden sm:inline text-[10px]">TUTUP [Y]</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-8 h-8 pixel-btn pixel-btn-red rounded text-xs font-pixel flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              title="Tutup [ESC]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {inventory.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-5xl animate-bounce">🎒</span>
              <p className="font-pixel text-xs sm:text-sm text-amber-300">
                Tas kamu sedang kosong!
              </p>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                Jelajahi area Sarwadadi, kumpulkan sampah yang berserakan, lalu bawa kembali ke sini!
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="mt-2 pixel-btn pixel-btn-green px-5 py-2.5 rounded font-pixel text-xs flex items-center gap-2 shadow-lg"
              >
                <span className="text-base font-bold">▲</span>
                <span>KEMBALI EKSPLORASI [Y]</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Feedback Alert Overlay */}
              {feedback && (
                <div
                  className={`mb-3 p-3.5 rounded-lg border-2 text-center animate-in zoom-in-95 ${
                    feedback.isCorrect
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-xl'
                      : 'bg-rose-950/90 border-rose-400 text-rose-200 shadow-xl'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-1">
                    {feedback.isCorrect ? '✨ BENAR SEKALI! ✨' : '❌ KURANG TEPAT!'}
                  </div>
                  <div className="font-pixel text-xs sm:text-sm">
                    {feedback.isCorrect ? (
                      <span className="text-yellow-300 font-bold">
                        +{feedback.coins} Koin berhasil ditabung!
                      </span>
                    ) : (
                      <span>
                        {feedback.itemName} harusnya masuk ke kategori{' '}
                        <b className="underline text-yellow-300">{feedback.correctCategory}</b>!
                      </span>
                    )}
                  </div>
                  {feedback.explanation && (
                    <p className="text-[11px] sm:text-xs text-slate-200 mt-2 font-medium bg-black/40 p-2 rounded border border-white/10">
                      💡 "{feedback.explanation}"
                    </p>
                  )}
                </div>
              )}

              {/* Current Item Card with HUGE icon for Elementary School Kids */}
              {currentItem && (
                <div className="bg-[#1e261f] p-3.5 sm:p-4 rounded-xl border-2 border-[#38483a] mb-3.5 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#121813] border-4 border-emerald-500/50 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-2xl animate-pulse">
                    {currentItem.icon}
                    {/* Category icon badge tag */}
                    <span className="absolute -bottom-2 -right-2 text-base bg-black/80 p-1 rounded-full border border-white/20">
                      {currentItem.kategori_id === 'Organik' ? '🍃' : currentItem.kategori_id === 'Anorganik' ? '📦' : '☣️'}
                    </span>
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                      <h3 className="font-pixel text-sm sm:text-base text-yellow-300 font-bold">
                        {currentItem.nama_sampah}
                      </h3>
                      <span
                        className={`text-[9px] font-pixel px-2 py-0.5 rounded shadow-sm ${
                          currentItem.rarity === 'Rare'
                            ? 'bg-rose-600 text-white'
                            : currentItem.rarity === 'Uncommon'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {currentItem.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {currentItem.deskripsi}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] sm:text-[11px] font-pixel">
                      <span className="text-emerald-400">
                        Sisa di tas: {inventory.length} item
                      </span>
                      <span className="text-amber-400 font-bold">
                        Nilai: +{currentItem.nilai_koin} Koin
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Color-Coded Target Selection Bins with Controller Prompts */}
              <p className="text-center font-pixel text-[11px] sm:text-xs text-slate-300 mb-2.5 flex items-center justify-center gap-2">
                <span>PILIH TONG SAMPAH:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Organik */}
                <button
                  onClick={() => handleSelectCategory('Organik')}
                  disabled={feedback !== null}
                  className="pixel-btn pixel-btn-green p-3 rounded-xl flex flex-col items-center text-center gap-1.5 hover:scale-[1.02] transition-transform shadow-lg group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">🍃</span>
                    <span className="font-pixel text-xs text-emerald-950 font-bold">
                      ORGANIK
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <span className="text-[9px] text-emerald-900 bg-white/50 px-1.5 py-0.5 rounded font-bold font-pixel">
                      +100 Koin
                    </span>
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-pixel">
                      [A / ✕]
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-emerald-950 font-medium">
                    Sisa makanan, daun, buah
                  </span>
                </button>

                {/* 2. Anorganik */}
                <button
                  onClick={() => handleSelectCategory('Anorganik')}
                  disabled={feedback !== null}
                  className="pixel-btn pixel-btn-amber p-3 rounded-xl flex flex-col items-center text-center gap-1.5 hover:scale-[1.02] transition-transform shadow-lg group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">📦</span>
                    <span className="font-pixel text-xs text-amber-950 font-bold">
                      ANORGANIK
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <span className="text-[9px] text-amber-900 bg-white/50 px-1.5 py-0.5 rounded font-bold font-pixel">
                      +250 Koin
                    </span>
                    <span className="bg-amber-950 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-pixel">
                      [B / ⭕]
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-amber-950 font-medium">
                    Plastik, kaleng, kardus
                  </span>
                </button>

                {/* 3. B3 */}
                <button
                  onClick={() => handleSelectCategory('B3')}
                  disabled={feedback !== null}
                  className="pixel-btn pixel-btn-red p-3 rounded-xl flex flex-col items-center text-center gap-1.5 hover:scale-[1.02] transition-transform shadow-lg group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">☣️</span>
                    <span className="font-pixel text-xs text-rose-950 font-bold">
                      B3 (BERACUN)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <span className="text-[9px] text-rose-900 bg-white/50 px-1.5 py-0.5 rounded font-bold font-pixel">
                      +500 Koin
                    </span>
                    <span className="bg-rose-950 text-rose-300 text-[9px] px-1.5 py-0.5 rounded font-pixel">
                      [X / ⬜]
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-rose-950 font-medium">
                    Baterai, bohlam, obat
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="mt-3 pt-2.5 border-t border-[#3d4d3f] flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span>Tekan tombol Segitiga</span>
            <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded font-pixel flex items-center gap-1">
              <span className="text-sm leading-none font-bold">▲</span> Y
            </span>
            <span>atau ESC untuk tutup tas</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="pixel-btn pixel-btn-gray px-3 py-1 rounded text-[10px] font-pixel text-slate-200"
          >
            TUTUP [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

