import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { LevelConfig, LevelQuiz, QuizQuestion } from '../types';
import { QUIZZES } from '../data/gameData';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface QuizCheckpointModalProps {
  isOpen: boolean;
  level: LevelConfig;
  onPassQuiz: () => void;
  onOpenMateri: () => void;
  onRetryLevel: () => void;
}

export const QuizCheckpointModal: React.FC<QuizCheckpointModalProps> = ({
  isOpen,
  level,
  onPassQuiz,
  onOpenMateri,
  onRetryLevel
}) => {
  const quiz: LevelQuiz | undefined = QUIZZES[level.level_id];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gamepadActive, setGamepadActive] = useState(false);
  const [gamepadType, setGamepadType] = useState<'xbox' | 'dualshock' | 'generic'>('generic');

  // Reset quiz state when modal opens or level changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setCorrectCount(0);
      setQuizFinished(false);
    }
  }, [isOpen, level.level_id]);

  const currentQ: QuizQuestion | undefined = quiz?.pertanyaan[currentIdx];
  const totalQ = quiz ? quiz.pertanyaan.length : 0;
  const isPassed = correctCount >= level.min_quiz_score;

  // Stable refs for gamepad polling and keyboard handling to prevent stale closures
  const currentQRef = useRef(currentQ);
  currentQRef.current = currentQ;
  const currentIdxRef = useRef(currentIdx);
  currentIdxRef.current = currentIdx;
  const totalQRef = useRef(totalQ);
  totalQRef.current = totalQ;
  const isAnswerSubmittedRef = useRef(isAnswerSubmitted);
  isAnswerSubmittedRef.current = isAnswerSubmitted;
  const selectedAnswerRef = useRef(selectedAnswer);
  selectedAnswerRef.current = selectedAnswer;
  const correctCountRef = useRef(correctCount);
  correctCountRef.current = correctCount;
  const quizFinishedRef = useRef(quizFinished);
  quizFinishedRef.current = quizFinished;
  const isPassedRef = useRef(isPassed);
  isPassedRef.current = isPassed;
  const quizFinishedAtRef = useRef<number>(0);

  const handleSelectOption = useCallback((opt: 'a' | 'b' | 'c' | 'd') => {
    if (isAnswerSubmittedRef.current) return;
    soundManager.playClick();
    setSelectedAnswer(opt);
    selectedAnswerRef.current = opt;
    gamepadManager.vibrate(60, 0.2, 0.2);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    const activeQ = currentQRef.current;
    const chosen = selectedAnswerRef.current;
    if (!activeQ || !chosen || isAnswerSubmittedRef.current) return;

    setIsAnswerSubmitted(true);
    isAnswerSubmittedRef.current = true;

    const isCorrect = chosen === activeQ.jawaban_benar;
    if (isCorrect) {
      soundManager.playCoin();
      setCorrectCount((prev) => {
        const next = prev + 1;
        correctCountRef.current = next;
        return next;
      });
      gamepadManager.vibrate(150, 0.4, 0.5);
    } else {
      soundManager.playWrong();
      gamepadManager.vibrate(250, 0.6, 0.3);
    }
  }, []);

  const handleNextQuestion = useCallback(() => {
    soundManager.playClick();
    const currIdx = currentIdxRef.current;
    const total = totalQRef.current;

    if (currIdx + 1 < total) {
      setCurrentIdx((prev) => {
        const next = prev + 1;
        currentIdxRef.current = next;
        return next;
      });
      setSelectedAnswer(null);
      selectedAnswerRef.current = null;
      setIsAnswerSubmitted(false);
      isAnswerSubmittedRef.current = false;
    } else {
      // Quiz Finished
      setQuizFinished(true);
      quizFinishedRef.current = true;
      quizFinishedAtRef.current = Date.now() + 450;
      const passed = correctCountRef.current >= level.min_quiz_score;
      if (passed) {
        soundManager.playVictory();
        gamepadManager.vibrate(400, 0.7, 0.7);
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        soundManager.playWrong();
      }
    }
  }, [level.min_quiz_score]);

  const handleResetQuiz = useCallback(() => {
    soundManager.playClick();
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    setSelectedAnswer(null);
    selectedAnswerRef.current = null;
    setIsAnswerSubmitted(false);
    isAnswerSubmittedRef.current = false;
    setCorrectCount(0);
    correctCountRef.current = 0;
    setQuizFinished(false);
    quizFinishedRef.current = false;
  }, []);

  // Gamepad Polling Loop inside Quiz Modal
  useEffect(() => {
    if (!isOpen || !quiz) return;

    let animId: number;
    let prevA = true;
    let prevB = true;
    let prevX = true;
    let prevY = true;
    let prevStart = true;
    let prevRb = true;
    let prevRt = true;
    let prevDpadUp = true;
    let prevDpadDown = true;
    let firstPoll = true;

    const poll = () => {
      const gp = gamepadManager.poll();
      if (gp.connected) {
        setGamepadActive(true);
        if (gp.type === 'dualshock') setGamepadType('dualshock');
        else if (gp.type === 'xbox') setGamepadType('xbox');
        else setGamepadType('generic');

        if (firstPoll) {
          prevA = gp.buttons.a;
          prevB = gp.buttons.b;
          prevX = gp.buttons.x;
          prevY = gp.buttons.y;
          prevStart = gp.buttons.start;
          prevRb = gp.buttons.rb;
          prevRt = gp.buttons.rt;
          prevDpadUp = gp.buttons.dpadUp;
          prevDpadDown = gp.buttons.dpadDown;
          firstPoll = false;
        }

        const isStartJustPressed =
          (gp.buttons.start && !prevStart) ||
          (gp.buttons.rb && !prevRb) ||
          (gp.buttons.rt && !prevRt);

        if (!quizFinishedRef.current) {
          if (!isAnswerSubmittedRef.current) {
            // Face button selection or confirm
            // Button A (Option A): if already selected, lock/submit answer!
            if (gp.buttons.a && !prevA) {
              if (selectedAnswerRef.current === 'a') {
                handleSubmitAnswer();
              } else {
                handleSelectOption('a');
              }
            }
            // Button B (Option B): if already selected, lock/submit answer!
            else if (gp.buttons.b && !prevB) {
              if (selectedAnswerRef.current === 'b') {
                handleSubmitAnswer();
              } else {
                handleSelectOption('b');
              }
            }
            // Button X (Option C): if already selected, lock/submit answer!
            else if (gp.buttons.x && !prevX) {
              if (selectedAnswerRef.current === 'c') {
                handleSubmitAnswer();
              } else {
                handleSelectOption('c');
              }
            }
            // Button Y (Option D): if already selected, lock/submit answer!
            else if (gp.buttons.y && !prevY) {
              if (selectedAnswerRef.current === 'd') {
                handleSubmitAnswer();
              } else {
                handleSelectOption('d');
              }
            }
            // D-Pad Up / Down cycling
            else if (gp.buttons.dpadDown && !prevDpadDown) {
              soundManager.playClick();
              const curr = selectedAnswerRef.current;
              let next: 'a' | 'b' | 'c' | 'd' = 'a';
              if (curr === 'a') next = 'b';
              else if (curr === 'b') next = 'c';
              else if (curr === 'c') next = 'd';
              else next = 'a';
              setSelectedAnswer(next);
              selectedAnswerRef.current = next;
            } else if (gp.buttons.dpadUp && !prevDpadUp) {
              soundManager.playClick();
              const curr = selectedAnswerRef.current;
              let next: 'a' | 'b' | 'c' | 'd' = 'd';
              if (curr === 'd') next = 'c';
              else if (curr === 'c') next = 'b';
              else if (curr === 'b') next = 'a';
              else next = 'd';
              setSelectedAnswer(next);
              selectedAnswerRef.current = next;
            }
            // Start / RB / RT button -> KUNCI JAWABAN
            else if (isStartJustPressed) {
              if (selectedAnswerRef.current) {
                handleSubmitAnswer();
              } else {
                // If no answer selected yet, select option 'a' first so next press locks it
                handleSelectOption('a');
              }
            }
          } else {
            // When answer is already submitted: A or START advances to next question!
            if ((gp.buttons.a && !prevA) || (gp.buttons.b && !prevB) || isStartJustPressed) {
              handleNextQuestion();
            }
          }
        } else {
          // In Quiz Results with grace period:
          if (Date.now() >= quizFinishedAtRef.current) {
            if (isPassedRef.current) {
              if ((gp.buttons.a && !prevA) || isStartJustPressed) {
                soundManager.playClick();
                onPassQuiz();
              }
            } else {
              // Not passed
              if ((gp.buttons.a && !prevA) || isStartJustPressed) {
                handleResetQuiz();
              } else if (gp.buttons.x && !prevX) {
                soundManager.playClick();
                onOpenMateri();
              } else if (gp.buttons.y && !prevY) {
                soundManager.playClick();
                onRetryLevel();
              }
            }
          }
        }

        prevA = gp.buttons.a;
        prevB = gp.buttons.b;
        prevX = gp.buttons.x;
        prevY = gp.buttons.y;
        prevStart = gp.buttons.start;
        prevRb = gp.buttons.rb;
        prevRt = gp.buttons.rt;
        prevDpadUp = gp.buttons.dpadUp;
        prevDpadDown = gp.buttons.dpadDown;
      }

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, quiz, onPassQuiz, onOpenMateri, onRetryLevel, handleSelectOption, handleSubmitAnswer, handleNextQuestion, handleResetQuiz]);

  // Keyboard Shortcuts for Quiz
  useEffect(() => {
    if (!isOpen || !quiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quizFinishedRef.current) {
        if (!isAnswerSubmittedRef.current) {
          if (e.key === 'a' || e.key === 'A' || e.key === '1') {
            if (selectedAnswerRef.current === 'a') {
              handleSubmitAnswer();
            } else {
              handleSelectOption('a');
            }
          } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
            if (selectedAnswerRef.current === 'b') {
              handleSubmitAnswer();
            } else {
              handleSelectOption('b');
            }
          } else if (e.key === 'c' || e.key === 'C' || e.key === '3') {
            if (selectedAnswerRef.current === 'c') {
              handleSubmitAnswer();
            } else {
              handleSelectOption('c');
            }
          } else if (e.key === 'd' || e.key === 'D' || e.key === '4') {
            if (selectedAnswerRef.current === 'd') {
              handleSubmitAnswer();
            } else {
              handleSelectOption('d');
            }
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (selectedAnswerRef.current) {
              handleSubmitAnswer();
            } else {
              handleSelectOption('a');
            }
          }
        } else {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNextQuestion();
          }
        }
      } else {
        if (Date.now() >= quizFinishedAtRef.current && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (isPassedRef.current) onPassQuiz();
          else handleResetQuiz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, quiz, onPassQuiz, handleSelectOption, handleSubmitAnswer, handleNextQuestion, handleResetQuiz]);

  if (!isOpen || !quiz || (!currentQ && !quizFinished)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl pixel-box rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl border-4 border-[#1e2a20] max-h-[92vh] flex flex-col overflow-y-auto animate-in zoom-in-95">
        {/* Quiz Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4d3f] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="text-xs sm:text-sm font-pixel text-yellow-400">
                CHECKPOINT: {quiz.judul.toUpperCase()}
              </h2>
              <p className="text-[11px] text-slate-300">
                Materi: <b className="text-emerald-400">{quiz.materi}</b> | Target:{' '}
                {level.min_quiz_score} dari {totalQ} Benar
              </p>
            </div>
          </div>
          <span className="bg-[#141a15] px-2.5 py-1 rounded text-[10px] font-pixel text-yellow-300 border border-yellow-500/30">
            Lv. {level.level_id}
          </span>
        </div>

        {/* Quiz Body */}
        {!quizFinished ? (
          <div>
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs font-pixel text-slate-400 mb-3">
              <span>Pertanyaan {currentIdx + 1} / {totalQ}</span>
              <span className="text-emerald-400 font-bold">Skor: {correctCount} Benar</span>
            </div>

            {/* Question Text Box */}
            <div className="p-4 bg-[#1b241d] rounded-lg border-2 border-[#3a4c3d] mb-4">
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ.pertanyaan}
              </p>
            </div>

            {/* 4 Multiple Choice Options with Gamepad badging */}
            <div className="space-y-2.5 mb-4">
              {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                const optText =
                  opt === 'a'
                    ? currentQ.opsi_a
                    : opt === 'b'
                    ? currentQ.opsi_b
                    : opt === 'c'
                    ? currentQ.opsi_c
                    : currentQ.opsi_d;

                const isSelected = selectedAnswer === opt;
                const isCorrect = currentQ.jawaban_benar === opt;

                // Controller badges
                const psIcon = opt === 'a' ? '✕' : opt === 'b' ? '⭕' : opt === 'c' ? '⬜' : '🔺';
                const xboxIcon = opt === 'a' ? 'A' : opt === 'b' ? 'B' : opt === 'c' ? 'X' : 'Y';
                const padBadge = gamepadType === 'dualshock' ? psIcon : xboxIcon;

                let btnStyle =
                  'bg-[#232f25] border-[#3d4f40] hover:bg-[#2b3a2e] text-slate-200';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-900 border-emerald-400 text-emerald-100 font-bold scale-[1.01]';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-900 border-rose-400 text-rose-100 font-bold';
                  }
                } else if (isSelected) {
                  btnStyle =
                    'bg-yellow-900/70 border-yellow-400 text-yellow-200 font-bold ring-2 ring-yellow-400/40';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-3 rounded-lg border-2 text-left flex items-start gap-3 transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <span className="font-pixel text-xs bg-black/50 px-2 py-0.5 rounded uppercase">
                        {opt}
                      </span>
                      <span
                        className={`text-[10px] font-pixel px-1.5 py-0.5 rounded border ${
                          opt === 'a'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : opt === 'b'
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : opt === 'c'
                            ? 'bg-blue-950 border-blue-500 text-blue-300'
                            : 'bg-amber-950 border-amber-500 text-amber-300'
                        }`}
                        title="Tombol Gamepad"
                      >
                        {padBadge}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm leading-snug flex-1">
                      {optText}
                    </span>

                    {isAnswerSubmitted && isCorrect && (
                      <span className="text-emerald-400 font-pixel text-xs shrink-0">
                        ✓ BENAR
                      </span>
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <span className="text-rose-400 font-pixel text-xs shrink-0">
                        ✗ SALAH
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {isAnswerSubmitted && (
              <div className="p-3 bg-[#162018] rounded-lg border border-emerald-500/50 text-xs text-slate-300 mb-4 animate-in fade-in">
                <span className="font-pixel text-[10px] text-emerald-400 block mb-1">
                  💡 PENJELASAN EDUKASI 3R:
                </span>
                <p className="leading-relaxed">{currentQ.penjelasan}</p>
              </div>
            )}

            {/* Navigation / Submit Buttons with Controller Hints */}
            <div className="space-y-2">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className={`w-full py-3.5 pixel-btn rounded-lg font-pixel text-xs flex items-center justify-center gap-2 ${
                    selectedAnswer ? 'pixel-btn-amber' : 'pixel-btn-gray opacity-50'
                  }`}
                >
                  <span>🔒 KUNCI JAWABAN</span>
                  {selectedAnswer && (
                    <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] text-yellow-300">
                      [START / ENTER]
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 pixel-btn pixel-btn-green rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>
                    {currentIdx + 1 < totalQ
                      ? 'PERTANYAAN BERIKUTNYA ➔'
                      : 'LIHAT HASIL KUIS 🏆'}
                  </span>
                  <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] text-emerald-200">
                    [A / ✕ / START]
                  </span>
                </button>
              )}

              {/* Gamepad Helper Hint Footer */}
              <div className="text-center text-[10px] text-slate-400 font-pixel pt-1">
                🎮 Kontrol Gamepad:{' '}
                <span className="text-emerald-300">
                  A/✕(Opsi A) • B/⭕(Opsi B) • X/⬜(Opsi C) • Y/🔺(Opsi D) • START(Kunci)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Results Screen */
          <div className="text-center py-4 space-y-4">
            <div className="text-5xl animate-bounce">
              {isPassed ? '🏆🎉' : '📚💪'}
            </div>

            <div>
              <h3
                className={`font-pixel text-base sm:text-lg mb-1 ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPassed
                  ? 'SELAMAT! KAMU LULUS CHECKPOINT!'
                  : 'BELUM MEMENUHI SYARAT KELULUSAN'}
              </h3>
              <p className="text-xs text-slate-300">
                Kamu menjawab <b className="text-yellow-400 font-pixel">{correctCount}</b> dari{' '}
                <b className="text-yellow-400 font-pixel">{totalQ}</b> soal dengan benar (Minimal{' '}
                {level.min_quiz_score} Benar).
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {isPassed ? (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onPassQuiz();
                  }}
                  className="w-full py-4 pixel-btn pixel-btn-green rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
                >
                  <span>🚀</span>
                  <span>
                    {level.level_id === 3
                      ? 'LIHAT HASIL AKHIR & SERTIFIKAT'
                      : 'LANJUT KE LEVEL BERIKUTNYA'}
                  </span>
                  <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">
                    [A / ✕ / START]
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleResetQuiz}
                    className="w-full py-3 pixel-btn pixel-btn-amber rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
                  >
                    <span>🔄 ULANGI KUIS CHECKPOINT</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">[A / ✕]</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenMateri();
                    }}
                    className="w-full py-3 pixel-btn pixel-btn-blue rounded-lg font-pixel text-xs flex items-center justify-center gap-2"
                  >
                    <span>📖 PELAJARI MATERI 3R DULU</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">[X / ⬜]</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onRetryLevel();
                    }}
                    className="w-full py-2.5 pixel-btn pixel-btn-gray rounded-lg font-pixel text-[10px] flex items-center justify-center gap-2"
                  >
                    <span>⚡ MAIN ULANG LEVEL INI</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[9px]">[Y / 🔺]</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
