import React, { useState, useEffect } from 'react';
import { Player, GameStats } from '../types';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';
import { LeaderboardModal } from './LeaderboardModal';

interface MainMenuProps {
  player: Player;
  gameStats: GameStats;
  onUpdatePlayer: (updated: Player) => void;
  onStartGame: () => void;
  onOpenPetunjuk: () => void;
  onOpenMateri: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  player,
  gameStats,
  onUpdatePlayer,
  onStartGame,
  onOpenPetunjuk,
  onOpenMateri,
  isMuted,
  onToggleSound
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState<Player>(player);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadLabel, setGamepadLabel] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    onUpdatePlayer(formData);
    setIsEditingProfile(false);
  };

  // Gamepad shortcuts for Main Menu
  useEffect(() => {
    let animId: number;
    let prevA = false;
    let prevX = false;
    let prevY = false;
    let prevStart = false;

    const poll = () => {
      const gp = gamepadManager.poll();
      setGamepadConnected(gp.connected);
      if (gp.connected) {
        setGamepadLabel(gamepadManager.getControllerLabel());

        if (!showLeaderboard && !isEditingProfile) {
          // A or START -> Mulai Game
          if ((gp.buttons.a && !prevA) || (gp.buttons.start && !prevStart)) {
            soundManager.playClick();
            onStartGame();
          }
          // X -> Petunjuk
          else if (gp.buttons.x && !prevX) {
            soundManager.playClick();
            onOpenPetunjuk();
          }
          // Y -> Leaderboard
          else if (gp.buttons.y && !prevY) {
            soundManager.playClick();
            setShowLeaderboard(true);
          }
        }
      }

      prevA = gp.buttons.a;
      prevX = gp.buttons.x;
      prevY = gp.buttons.y;
      prevStart = gp.buttons.start;

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [showLeaderboard, isEditingProfile, onStartGame, onOpenPetunjuk]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center animate-in fade-in select-none">
      {/* Top Bar with Sound Mute, Gamepad Status & Leaderboard Quick Link */}
      <div className="w-full flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇮🇩</span>
          <span className="font-pixel text-[10px] sm:text-xs text-emerald-400">
            DESA SARWADADI • TPS 3R
          </span>
          {gamepadConnected && (
            <span className="bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500 text-[9px] font-pixel text-emerald-300">
              🎮 {gamepadLabel || 'Gamepad Terhubung'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowLeaderboard(true);
            }}
            className="pixel-btn pixel-btn-amber px-3 py-1.5 rounded-lg text-xs font-pixel flex items-center gap-1.5 shadow-md"
            title="Lihat Papan Peringkat Siswa [Y / 🔺]"
          >
            <span>🏆</span>
            <span>LEADERBOARD</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className="pixel-btn pixel-btn-gray px-3 py-1.5 rounded-lg text-xs font-pixel flex items-center gap-1.5"
            title="Toggle Suara 8-bit"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'SUARA: MATI' : 'SUARA: AKTIF'}</span>
          </button>
        </div>
      </div>

      {/* Hero Game Logo & Title Box */}
      <div className="w-full pixel-box rounded-2xl p-6 sm:p-8 text-center mb-6 relative overflow-hidden border-4 border-[#1e2c21]">
        {/* Decorative Pixel Elements */}
        <div className="flex justify-center items-center gap-3 text-3xl sm:text-4xl mb-3">
          <span className="animate-bounce">🍃</span>
          <span className="text-4xl sm:text-5xl">🏛️</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            📦
          </span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>
            ☣️
          </span>
        </div>

        <div className="inline-block px-3 py-1 bg-[#152418] rounded-full border border-emerald-500/50 text-[10px] sm:text-xs font-pixel text-emerald-400 mb-2">
          SIMULASI PEMILAHAN SAMPAH & 3R
        </div>

        <h1 className="text-2xl sm:text-4xl font-pixel text-yellow-400 tracking-wider mb-2 drop-shadow-md">
          PETUALANGAN PILAH SAMPAH
        </h1>
        <h2 className="text-sm sm:text-base font-pixel text-emerald-300 mb-4">
          EDUKASI EKONOMI SIRKULAR DESA SARWADADI
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
          Jelajahi halaman SD Negeri Sarwadadi, Balai Desa, dan Lapangan Bola! Kumpulkan sampah berserakan, pilah ke wadah TPS 3R yang benar, dan raih koin serta sertifikat Duta Lingkungan!
        </p>

        {/* Menu Buttons */}
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame();
            }}
            className="w-full py-4 pixel-btn pixel-btn-green rounded-xl font-pixel text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-transform"
          >
            <span className="text-xl">▶</span>
            <span>MULAI GAME</span>
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] text-emerald-200">
              [A / ✕ / START]
            </span>
          </button>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                setShowLeaderboard(true);
              }}
              className="py-3 pixel-btn pixel-btn-amber rounded-lg font-pixel text-xs flex flex-col sm:flex-row items-center justify-center gap-1 shadow"
            >
              <span>🏆</span>
              <span>JUARA</span>
              <span className="hidden sm:inline bg-black/25 px-1 rounded text-[9px]">[Y]</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenPetunjuk();
              }}
              className="py-3 pixel-btn pixel-btn-amber rounded-lg font-pixel text-xs flex flex-col sm:flex-row items-center justify-center gap-1"
            >
              <span>🎮</span>
              <span>PETUNJUK</span>
              <span className="hidden sm:inline bg-black/25 px-1 rounded text-[9px]">[X]</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenMateri();
              }}
              className="py-3 pixel-btn pixel-btn-blue rounded-lg font-pixel text-xs flex flex-col sm:flex-row items-center justify-center gap-1"
            >
              <span>📖</span>
              <span>MATERI 3R</span>
            </button>
          </div>
        </div>
      </div>

      {/* Player Profile & Stats Banner */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Profile Card */}
        <div className="pixel-box rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-[#3b4c3e] pb-2">
            <h3 className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
              <span>👤</span> PROFIL SISWA PEMAIN
            </h3>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsEditingProfile(!isEditingProfile);
              }}
              className="text-[10px] font-pixel text-emerald-400 hover:underline"
            >
              {isEditingProfile ? 'Batal' : '✎ Edit Profil'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama:</span>
                <span className="font-pixel text-white font-bold">{player.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-pixel text-yellow-300">{player.kelas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sekolah:</span>
                <span className="text-white">{player.sekolah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender Karakter:</span>
                <span className="font-pixel text-emerald-400">
                  {player.jenis_kelamin === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                  NAMA LENGKAP:
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#141a15] border border-[#3e5040] rounded text-white text-xs font-pixel"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                    KELAS:
                  </label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#141a15] border border-[#3e5040] rounded text-white text-xs font-pixel"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                    KARAKTER:
                  </label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenis_kelamin: e.target.value as 'L' | 'P'
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#141a15] border border-[#3e5040] rounded text-white text-xs font-pixel"
                  >
                    <option value="L">👦 Putra (L)</option>
                    <option value="P">👧 Putri (P)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 pixel-btn pixel-btn-green rounded font-pixel text-[10px]"
              >
                SIMPAN PERUBAHAN
              </button>
            </form>
          )}
        </div>

        {/* Global Record Stats Card */}
        <div className="pixel-box rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-[#3b4c3e] pb-2">
            <h3 className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
              <span>📊</span> REKOR TABUNGAN KOIN
            </h3>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowLeaderboard(true);
              }}
              className="text-[10px] font-pixel text-yellow-400 hover:underline"
            >
              Lihat Ranking ➔
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-[#172218] rounded border border-[#364838]">
              <span className="text-xs">🪙</span>
              <div className="text-[10px] text-slate-400 mt-1">Total Koin</div>
              <div className="font-pixel text-sm font-bold text-yellow-400 mt-0.5">
                {gameStats.total_koin}
              </div>
            </div>

            <div className="p-2.5 bg-[#172218] rounded border border-[#364838]">
              <span className="text-xs">♻️</span>
              <div className="text-[10px] text-slate-400 mt-1">Sampah Dipilah</div>
              <div className="font-pixel text-sm font-bold text-emerald-400 mt-0.5">
                {gameStats.total_benar} Item
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#121913] rounded border border-[#2d3a2e] flex items-center justify-between text-[10px] font-pixel text-slate-400">
            <span>LEVEL TERBUKA:</span>
            <span className="text-emerald-400">
              {gameStats.unlocked_levels.length} / 3 LOKASI
            </span>
          </div>
        </div>
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
