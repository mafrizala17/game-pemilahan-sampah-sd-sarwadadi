import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, GameStats } from '../types';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';
import { LeaderboardModal } from './LeaderboardModal';

interface FinalResultScreenProps {
  player: Player;
  gameStats: GameStats;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const FinalResultScreen: React.FC<FinalResultScreenProps> = ({
  player,
  gameStats,
  onPlayAgain,
  onBackToMenu
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const totalSorted = gameStats.total_benar + gameStats.total_salah;
  const overallAccuracy =
    totalSorted > 0 ? Math.round((gameStats.total_benar / totalSorted) * 100) : 0;

  // Trigger celebration confetti on mount
  useEffect(() => {
    soundManager.playVictory();
    try {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  }, []);

  // Gamepad shortcuts on Final Result
  useEffect(() => {
    let animId: number;
    let prevA = false;
    let prevB = false;
    let prevY = false;
    let prevStart = false;

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected && !showLeaderboard) {
        if ((gp.buttons.a && !prevA) || (gp.buttons.start && !prevStart)) {
          soundManager.playClick();
          onPlayAgain();
        } else if (gp.buttons.y && !prevY) {
          soundManager.playClick();
          setShowLeaderboard(true);
        } else if (gp.buttons.b && !prevB) {
          soundManager.playClick();
          onBackToMenu();
        }
      }

      prevA = gp.buttons.a;
      prevB = gp.buttons.b;
      prevY = gp.buttons.y;
      prevStart = gp.buttons.start;

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [showLeaderboard, onPlayAgain, onBackToMenu]);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col items-center animate-in fade-in select-none">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2 animate-bounce">🏆🌟👑</div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-950/60 rounded-full border border-yellow-500/50 text-[11px] font-pixel text-yellow-300 mb-2">
          MISI EKONOMI SIRKULAR LENGKAP!
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-emerald-400">
          PETUALANGAN SARWADADI SELESAI
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
          Selamat! Kamu berhasil menuntaskan seluruh level dan menjaga kelestarian lingkungan Desa Sarwadadi!
        </p>
      </div>

      {/* Digital Certificate Box (Printable) */}
      <div
        ref={certificateRef}
        className="w-full bg-[#fbf8ee] text-[#2c3e50] rounded-xl p-6 sm:p-8 border-8 border-[#b8860b] shadow-2xl relative overflow-hidden mb-6"
      >
        {/* Certificate Decorative Corners */}
        <div className="absolute top-2 left-2 text-[#b8860b] text-xl">⚜️</div>
        <div className="absolute top-2 right-2 text-[#b8860b] text-xl">⚜️</div>
        <div className="absolute bottom-2 left-2 text-[#b8860b] text-xl">⚜️</div>
        <div className="absolute bottom-2 right-2 text-[#b8860b] text-xl">⚜️</div>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-[#b8860b]/40 pb-4 mb-5">
          <div className="font-pixel text-[10px] sm:text-xs text-[#8b6508] tracking-widest uppercase mb-1">
            PEMERINTAH DESA SARWADADI & TPS 3R
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1e3725]">
            SERTIFIKAT PENGHARGAAN
          </h2>
          <p className="text-xs font-pixel text-[#27ae60] mt-1">
            ★ DUTA LINGKUNGAN & PEMILAHAN SAMPAH 3R ★
          </p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-3 mb-6">
          <p className="text-xs text-slate-600 italic">Diberikan dengan bangga kepada:</p>
          <div className="text-2xl sm:text-3xl font-bold text-[#14421e] font-serif border-b border-[#2c3e50]/20 pb-1 inline-block min-w-[240px]">
            {player.nama || 'Siswa Berprestasi'}
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Kelas: <b>{player.kelas || 'SD'}</b> | Sekolah:{' '}
            <b>{player.sekolah || 'SD Negeri Sarwadadi'}</b>
          </p>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
            Telah berhasil menyelesaikan simulasi pemilahan sampah organik, anorganik, dan B3 serta lulus uji kompetensi 3R & Bank Sampah dengan predikat memuaskan.
          </p>
        </div>

        {/* Certificate Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f0ebd8] p-3 rounded-lg border border-[#d4af37]/50 text-center mb-6">
          <div className="p-1.5">
            <div className="text-[10px] text-slate-600 font-pixel">TOTAL KOIN</div>
            <div className="text-base font-bold text-[#d35400] font-pixel">
              {gameStats.total_koin} 🪙
            </div>
          </div>
          <div className="p-1.5">
            <div className="text-[10px] text-slate-600 font-pixel">SAMPAH PILAH</div>
            <div className="text-base font-bold text-[#27ae60] font-pixel">
              {gameStats.total_benar} Item
            </div>
          </div>
          <div className="p-1.5">
            <div className="text-[10px] text-slate-600 font-pixel">AKURASI</div>
            <div className="text-base font-bold text-[#2980b9] font-pixel">
              {overallAccuracy}%
            </div>
          </div>
          <div className="p-1.5">
            <div className="text-[10px] text-slate-600 font-pixel">PREDIKAT</div>
            <div className="text-[11px] font-bold text-[#8e44ad] font-pixel pt-1">
              {overallAccuracy >= 80 ? 'SANGAT BAIK' : 'BAIK'}
            </div>
          </div>
        </div>

        {/* Certificate Signature Row */}
        <div className="flex justify-between items-end pt-2 text-[11px] text-slate-700 font-serif">
          <div className="text-center">
            <p>Koordinator TPS 3R</p>
            <div className="h-10 flex items-center justify-center font-cursive text-slate-500 italic text-sm">
              ~ Sarwadadi Bersih ~
            </div>
            <p className="font-bold border-t border-slate-400 pt-1">TPS 3R Sarwadadi</p>
          </div>
          <div className="text-center">
            <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            <div className="h-10 flex items-center justify-center text-2xl">
              🏅
            </div>
            <p className="font-bold border-t border-slate-400 pt-1">Kepala Sekolah / Desa</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-wrap gap-2.5 justify-center">
        <button
          onClick={handlePrintCertificate}
          className="pixel-btn pixel-btn-amber px-5 py-3 rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
        >
          <span>🖨️</span>
          <span>CETAK / SIMPAN SERTIFIKAT</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setShowLeaderboard(true);
          }}
          className="pixel-btn pixel-btn-amber px-5 py-3 rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
        >
          <span>🏆</span>
          <span>LEADERBOARD</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px]">[Y]</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="pixel-btn pixel-btn-green px-5 py-3 rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          <span>MAIN LAGI</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px]">[A / START]</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onBackToMenu();
          }}
          className="pixel-btn pixel-btn-gray px-5 py-3 rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
        >
          <span>🏠</span>
          <span>MENU UTAMA</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px]">[B]</span>
        </button>
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentPlayerName={player.nama}
      />
    </div>
  );
};
