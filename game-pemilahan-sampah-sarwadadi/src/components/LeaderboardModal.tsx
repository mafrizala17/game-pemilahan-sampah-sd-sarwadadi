import React, { useState, useEffect, useRef } from 'react';
import { LeaderboardEntry } from '../types';
import { leaderboardManager } from '../utils/leaderboardManager';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName = ''
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | '1' | '2' | '3'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDefaultConfirm, setShowDefaultConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntries(leaderboardManager.getEntries());
      setShowClearConfirm(false);
      setShowDefaultConfirm(false);
    }
  }, [isOpen]);

  // Gamepad listener for modal
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

  const filteredEntries = entries.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sekolah.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel =
      filterLevel === 'all' || item.level_tertinggi.toString() === filterLevel;
    return matchSearch && matchLevel;
  });

  const topThree = entries.slice(0, 3);

  const handleClearAll = () => {
    soundManager.playWrong();
    const emptyList = leaderboardManager.clearLeaderboard();
    setEntries(emptyList);
    setShowClearConfirm(false);
  };

  const handleRestoreDefault = () => {
    soundManager.playCoin();
    const defaultList = leaderboardManager.resetToDefault();
    setEntries(defaultList);
    setShowDefaultConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4d3f] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0 animate-bounce">🏆</span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-pixel text-yellow-400 truncate">
                PAPAN PERINGKAT JUARA (LEADERBOARD)
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Top Siswa Duta Pilah Sampah & Tabungan Koin TPS 3R Desa Sarwadadi
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 pixel-btn pixel-btn-red rounded text-xs font-pixel flex items-center justify-center shrink-0 ml-2"
            title="Tutup [B / Y / ESC]"
          >
            ✕
          </button>
        </div>

        {/* Top 3 Podium (Visual) if at least 3 entries exist */}
        {entries.length >= 3 && filterLevel === 'all' && searchQuery === '' && (
          <div className="grid grid-cols-3 gap-2 mb-3 pt-2 pb-1 shrink-0">
            {/* Rank 2 - Perak */}
            <div className="flex flex-col items-center justify-end">
              <div className="text-lg sm:text-xl mb-0.5">🥈</div>
              <div className="w-full bg-[#1b251d] border-2 border-slate-400/60 rounded-t-lg p-1.5 sm:p-2 text-center flex flex-col items-center overflow-hidden">
                <span className="font-pixel text-[9px] sm:text-[10px] text-slate-200 truncate w-full">
                  {topThree[1]?.nama}
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 truncate w-full">
                  {topThree[1]?.kelas}
                </span>
                <span className="font-pixel text-[10px] sm:text-xs text-yellow-400 font-bold mt-0.5">
                  {topThree[1]?.total_koin} 🪙
                </span>
                <div className="w-full h-8 sm:h-9 bg-slate-500/20 rounded mt-1 flex items-center justify-center font-pixel text-[10px] sm:text-xs text-slate-300">
                  #2
                </div>
              </div>
            </div>

            {/* Rank 1 - Emas */}
            <div className="flex flex-col items-center justify-end">
              <div className="text-2xl sm:text-3xl mb-0.5 animate-bounce">👑 🥇</div>
              <div className="w-full bg-[#2a2412] border-2 border-yellow-400 rounded-t-lg p-2 sm:p-2.5 text-center flex flex-col items-center shadow-lg overflow-hidden">
                <span className="font-pixel text-[10px] sm:text-xs text-yellow-300 font-bold truncate w-full">
                  {topThree[0]?.nama}
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-200 truncate w-full">
                  {topThree[0]?.kelas}
                </span>
                <span className="font-pixel text-xs sm:text-sm text-yellow-400 font-bold mt-0.5">
                  {topThree[0]?.total_koin} 🪙
                </span>
                <div className="w-full h-11 sm:h-12 bg-yellow-500/30 rounded mt-1 flex items-center justify-center font-pixel text-xs sm:text-sm text-yellow-300 font-bold border border-yellow-400/40">
                  #1 JUARA
                </div>
              </div>
            </div>

            {/* Rank 3 - Perunggu */}
            <div className="flex flex-col items-center justify-end">
              <div className="text-lg sm:text-xl mb-0.5">🥉</div>
              <div className="w-full bg-[#1b251d] border-2 border-amber-700/60 rounded-t-lg p-1.5 sm:p-2 text-center flex flex-col items-center overflow-hidden">
                <span className="font-pixel text-[9px] sm:text-[10px] text-amber-200 truncate w-full">
                  {topThree[2]?.nama}
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 truncate w-full">
                  {topThree[2]?.kelas}
                </span>
                <span className="font-pixel text-[10px] sm:text-xs text-yellow-400 font-bold mt-0.5">
                  {topThree[2]?.total_koin} 🪙
                </span>
                <div className="w-full h-7 sm:h-8 bg-amber-800/20 rounded mt-1 flex items-center justify-center font-pixel text-[10px] sm:text-xs text-amber-300">
                  #3
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
          <input
            type="text"
            placeholder="🔍 Cari nama siswa / kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-[#141a15] border border-[#3e5040] rounded text-white text-xs flex-1 min-w-[150px] focus:outline-none focus:border-yellow-400"
          />

          <div className="flex gap-1 text-[10px] font-pixel shrink-0">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-2.5 py-1 rounded border ${
                filterLevel === 'all'
                  ? 'bg-emerald-800 text-white border-emerald-400'
                  : 'bg-[#18221a] text-slate-400 border-[#314233]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterLevel('1')}
              className={`px-2 py-1 rounded border ${
                filterLevel === '1'
                  ? 'bg-emerald-800 text-white border-emerald-400'
                  : 'bg-[#18221a] text-slate-400 border-[#314233]'
              }`}
            >
              Lv.1
            </button>
            <button
              onClick={() => setFilterLevel('2')}
              className={`px-2 py-1 rounded border ${
                filterLevel === '2'
                  ? 'bg-emerald-800 text-white border-emerald-400'
                  : 'bg-[#18221a] text-slate-400 border-[#314233]'
              }`}
            >
              Lv.2
            </button>
            <button
              onClick={() => setFilterLevel('3')}
              className={`px-2 py-1 rounded border ${
                filterLevel === '3'
                  ? 'bg-emerald-800 text-white border-emerald-400'
                  : 'bg-[#18221a] text-slate-400 border-[#314233]'
              }`}
            >
              Lv.3
            </button>
          </div>
        </div>

        {/* Scrollable Leaderboard Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[140px]">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 px-4 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl">🌟</span>
              <p className="font-pixel text-xs sm:text-sm text-yellow-300">
                Belum ada data di Papan Peringkat
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm text-center">
                Mainkan game dan tuntaskan level untuk mencatat namamu sebagai Duta Lingkungan Desa Sarwadadi!
              </p>
              <button
                onClick={handleRestoreDefault}
                className="mt-2 pixel-btn pixel-btn-amber px-3 py-1.5 rounded font-pixel text-[10px]"
              >
                🔄 Muat Contoh Data Siswa
              </button>
            </div>
          ) : (
            filteredEntries.map((item, index) => {
              const isCurrent =
                currentPlayerName &&
                item.nama.trim().toLowerCase() === currentPlayerName.trim().toLowerCase();

              const rankMedal =
                index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

              return (
                <div
                  key={item.id || index}
                  className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors gap-2 ${
                    isCurrent
                      ? 'bg-yellow-950/60 border-yellow-400 text-yellow-100 shadow-md'
                      : index === 0
                      ? 'bg-[#232014] border-yellow-500/50 text-slate-100'
                      : 'bg-[#18221a] border-[#314233] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-7 text-center font-pixel text-xs sm:text-sm font-bold text-yellow-400 shrink-0">
                      {rankMedal}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-pixel text-[11px] sm:text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[200px]">
                          {item.nama}
                        </span>
                        {isCurrent && (
                          <span className="bg-yellow-400 text-yellow-950 text-[8px] font-pixel font-bold px-1 rounded shrink-0">
                            KAMU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {item.kelas} • {item.sekolah}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0">
                    <div className="hidden sm:block">
                      <span className="text-[9px] text-slate-400 block">Pilah / Akurasi</span>
                      <span className="text-[10px] text-emerald-400 font-pixel">
                        {item.sampah_dipilah} ({item.akurasi}%)
                      </span>
                    </div>

                    <div className="min-w-[65px] sm:min-w-[80px]">
                      <span className="text-[9px] text-slate-400 block">Koin</span>
                      <span className="font-pixel text-xs sm:text-sm text-yellow-400 font-bold">
                        +{item.total_koin} 🪙
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & database reset options */}
        <div className="mt-3 pt-2.5 border-t border-[#3d4d3f] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            {!showClearConfirm && !showDefaultConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[9px] sm:text-[10px] text-slate-400 hover:text-rose-400 underline font-pixel"
                  title="Kosongkan seluruh data skor"
                >
                  🗑️ Hapus Database
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setShowDefaultConfirm(true)}
                  className="text-[9px] sm:text-[10px] text-slate-400 hover:text-yellow-400 underline font-pixel"
                  title="Kembalikan data default"
                >
                  🔄 Reset Contoh
                </button>
              </div>
            ) : showClearConfirm ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-rose-400 text-[10px] font-pixel">Hapus semua data?</span>
                <button
                  onClick={handleClearAll}
                  className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-[9px] font-pixel"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[9px] font-pixel"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-300 text-[10px] font-pixel">Muat data contoh?</span>
                <button
                  onClick={handleRestoreDefault}
                  className="px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-white rounded text-[9px] font-pixel"
                >
                  Ya, Muat
                </button>
                <button
                  onClick={() => setShowDefaultConfirm(false)}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[9px] font-pixel"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline text-slate-400 text-[10px]">
              [B / Y / ESC]
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="pixel-btn pixel-btn-green px-4 py-1.5 rounded text-xs font-pixel"
            >
              TUTUP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
