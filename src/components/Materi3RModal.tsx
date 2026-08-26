import React, { useEffect } from 'react';
import { MATERI_3R, CATEGORIES } from '../data/gameData';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface Materi3RModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Materi3RModal: React.FC<Materi3RModalProps> = ({ isOpen, onClose }) => {
  // Gamepad listener for Materi3RModal
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
      <div className="relative w-full max-w-2xl pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4d3f] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-2xl sm:text-3xl shrink-0">🌱</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm md:text-base font-pixel text-emerald-400 truncate">
                MATERI EDUKASI 3R & EKONOMI SIRKULAR
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Panduan Cerdas Mengelola Sampah di Desa Sarwadadi
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

        {/* Content Tabs / Cards */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3.5 text-xs">
          {/* 3 Categories Section */}
          <div className="bg-[#19221a] p-3.5 rounded-lg border border-emerald-600/40">
            <h3 className="font-pixel text-xs text-yellow-300 mb-2 flex items-center gap-1.5">
              <span>🗑️</span> 3 KATEGORI TEMPAT SAMPAH (TPS 3R)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Organik */}
              <div className="p-2.5 rounded bg-[#102919] border border-emerald-500/60">
                <div className="flex items-center gap-1.5 font-pixel text-[11px] text-emerald-300 mb-1">
                  <span>🍃</span> HIJAU: ORGANIK
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-1.5">
                  Sampah sisa makhluk hidup yang bisa membusuk alami.
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  Contoh: Daun, kulit buah, sisa makanan, ranting.
                </div>
              </div>

              {/* Anorganik */}
              <div className="p-2.5 rounded bg-[#2e230e] border border-amber-500/60">
                <div className="flex items-center gap-1.5 font-pixel text-[11px] text-amber-300 mb-1">
                  <span>📦</span> KUNING: ANORGANIK
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-1.5">
                  Sampah sulit terurai, tapi bisa didaur ulang / disetor ke Bank Sampah!
                </p>
                <div className="text-[10px] text-amber-400 font-semibold">
                  Contoh: Botol plastik, kaleng, kardus, kresek.
                </div>
              </div>

              {/* B3 */}
              <div className="p-2.5 rounded bg-[#2d1115] border border-rose-500/60">
                <div className="flex items-center gap-1.5 font-pixel text-[11px] text-rose-300 mb-1">
                  <span>☣️</span> MERAH: B3
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-1.5">
                  Bahan Berbahaya & Beracun, jangan dicampur atau dibakar!
                </p>
                <div className="text-[10px] text-rose-400 font-semibold">
                  Contoh: Baterai, lampu pecah, obat kadaluarsa, kaleng racun nyamuk.
                </div>
              </div>
            </div>
          </div>

          {/* 3R Core Pillars */}
          {MATERI_3R.map((mat, i) => (
            <div
              key={i}
              className="p-3.5 bg-[#1e2720] rounded-lg border border-[#384a3c] space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{mat.icon}</span>
                <h4 className="font-pixel text-xs text-emerald-300">{mat.title}</h4>
              </div>
              <p className="text-xs text-slate-300 font-medium">{mat.summary}</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                {mat.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#3d4d3f] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Tekan</span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.5 rounded font-pixel font-bold flex items-center gap-1">
              <span className="text-xs text-emerald-400 font-bold">▲</span> Y / ESC
            </span>
            <span>untuk kembali</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="pixel-btn pixel-btn-green px-5 py-2 rounded font-pixel text-xs flex items-center gap-1.5 shadow-md"
          >
            <span>SAYA MENGERTI</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

