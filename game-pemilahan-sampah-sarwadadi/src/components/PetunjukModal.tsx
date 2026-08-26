import React, { useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface PetunjukModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PetunjukModal: React.FC<PetunjukModalProps> = ({ isOpen, onClose }) => {
  // Gamepad listener for PetunjukModal
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    let prevButtonB = false;
    let prevButtonY = false;
    let prevStart = false;

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected) {
        if ((gp.buttons.b && !prevButtonB) || (gp.buttons.y && !prevButtonY) || (gp.buttons.start && !prevStart)) {
          soundManager.playClick();
          onClose();
        }
      }
      prevButtonB = gp.buttons.b;
      prevButtonY = gp.buttons.y;
      prevStart = gp.buttons.start;
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4d3f] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-2xl sm:text-3xl shrink-0">🎮</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm md:text-base font-pixel text-yellow-400 truncate">
                PETUNJUK CARA BERMAIN
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Panduan Kontrol & Mekanisme Game Pemilahan Sampah
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 pixel-btn pixel-btn-red rounded text-xs font-pixel flex items-center justify-center shrink-0 ml-2 shadow-md hover:scale-105 transition-transform"
            title="Tutup [▲ / Y / ESC]"
          >
            ✕
          </button>
        </div>

        {/* Instructions Body */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 text-xs">
          {/* Step 1: Controls */}
          <div className="p-3 bg-[#1e2720] rounded-lg border border-[#3d4f40]">
            <h3 className="font-pixel text-xs text-emerald-400 mb-2 flex items-center gap-2">
              <span>⌨️</span> 1. KONTROL KARAKTER
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <b className="text-yellow-300 font-pixel text-[10px] block mb-1">
                  KOMPUTER / LAPTOP:
                </b>
                <p className="leading-snug">• <b>WASD</b> / <b>Panah</b>: Gerak</p>
                <p className="leading-snug">• <b>Spasi</b>: Ambil Sampah</p>
                <p className="leading-snug">• <b>E</b>: Setor di TPS 3R</p>
                <p className="leading-snug">• <b>Y / ESC</b>: Tutup Tas</p>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <b className="text-emerald-300 font-pixel text-[10px] block mb-1">
                  🎮 GAMEPAD (XBOX/PS):
                </b>
                <p className="leading-snug">• <b>Stick / D-Pad</b>: Gerak</p>
                <p className="leading-snug">• <b>Tombol A / ✕</b>: Ambil</p>
                <p className="leading-snug">• <b>Tombol X / ⬜</b>: Buka TPS</p>
                <p className="leading-snug">• <b>Tombol Y / ▲</b>: Tutup Tas</p>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <b className="text-amber-300 font-pixel text-[10px] block mb-1">
                  HP / TABLET:
                </b>
                <p className="leading-snug">• <b>Virtual D-Pad</b> di layar</p>
                <p className="leading-snug">• Tombol <b>AMBIL</b></p>
                <p className="leading-snug">• Tombol <b>SETOR TPS</b></p>
              </div>
            </div>
          </div>

          {/* Step 2: Loop Gameplay */}
          <div className="p-3 bg-[#1e2720] rounded-lg border border-[#3d4f40] space-y-2">
            <h3 className="font-pixel text-xs text-amber-400 flex items-center gap-2">
              <span>♻️</span> 2. ALUR PERMAINAN (GAMEPLAY LOOP)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-0.5 leading-relaxed text-[11px]">
              <li>
                <b>Cari Sampah:</b> Jelajahi peta area desa sebelum batas waktu habis!
              </li>
              <li>
                <b>Ambil & Bawa:</b> Dekati sampah, tekan <b>Ambil / [A]</b> untuk memasukkannya ke tas.
              </li>
              <li>
                <b>Setor di TPS 3R:</b> Bawa ke bangunan TPS 3R di tengah peta, pilih wadah yang tepat:
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-pixel">
                  <span className="bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded">🍃 Organik (+100)</span>
                  <span className="bg-amber-800 text-amber-100 px-2 py-0.5 rounded">📦 Anorganik (+250)</span>
                  <span className="bg-rose-800 text-rose-100 px-2 py-0.5 rounded">☣️ B3 (+500)</span>
                </div>
              </li>
              <li>
                <b>Kuis Checkpoint:</b> Setelah waktu habis, jawab kuis 3R untuk membuka level selanjutnya.
              </li>
            </ol>
          </div>

          {/* Step 3: Level Progression */}
          <div className="p-3 bg-[#1e2720] rounded-lg border border-[#3d4f40]">
            <h3 className="font-pixel text-xs text-blue-400 mb-1.5 flex items-center gap-2">
              <span>🗺️</span> 3. TINGKATAN LEVEL
            </h3>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• <b>Level 1 (30 Detik):</b> SD Negeri Sarwadadi (Organik & Anorganik)</li>
              <li>• <b>Level 2 (25 Detik):</b> Balai Desa Sarwadadi (+ Sampah B3)</li>
              <li>• <b>Level 3 (15 Detik):</b> Lapangan Bola Desa Sarwadadi (Final Challenge Cepat!)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#3d4d3f] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Tekan</span>
            <span className="bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded font-pixel font-bold flex items-center gap-1">
              <span className="text-xs text-amber-400 font-bold">▲</span> Y / ESC
            </span>
            <span>untuk kembali</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="pixel-btn pixel-btn-amber px-5 py-2 rounded font-pixel text-xs flex items-center gap-1.5 shadow-md"
          >
            <span>SIAP BERMAIN!</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

