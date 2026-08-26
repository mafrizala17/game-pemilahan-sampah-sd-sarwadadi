import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelConfig, SpawnedTrash, TrashItem, Player, WasteCategory } from '../types';
import { TRASH_ITEMS } from '../data/gameData';
import { PixelMapRenderer, FloatText, Obstacle } from '../utils/pixelRenderer';
import { soundManager } from '../utils/audio';
import { gamepadManager } from '../utils/gamepadManager';

interface GameCanvasProps {
  level: LevelConfig;
  player: Player;
  inventory: TrashItem[];
  onPickupTrash: (item: TrashItem) => boolean;
  onOpenTPS: () => void;
  isSortingOpen: boolean;
  isPaused: boolean;
  timeRemaining: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  player,
  inventory,
  onPickupTrash,
  onOpenTPS,
  isSortingOpen,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Virtual Game World dimensions (800 x 550)
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 550;

  // Player State
  const playerPosRef = useRef({ x: 260, y: 320 });
  const playerDirRef = useRef<'down' | 'up' | 'left' | 'right'>('down');
  const isMovingRef = useRef(false);
  const walkFrameRef = useRef(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // TPS Hub Position
  const tpsPos = { x: 330, y: 160, w: 140, h: 70 };

  // Spawned Trash Items
  const [spawnedTrash, setSpawnedTrash] = useState<SpawnedTrash[]>([]);
  const spawnedTrashRef = useRef<SpawnedTrash[]>([]);
  spawnedTrashRef.current = spawnedTrash;

  // Floating text popups
  const floatTextsRef = useRef<FloatText[]>([]);

  // Near TPS state for prompt button
  const [isNearTPS, setIsNearTPS] = useState(false);
  const [nearbyTrash, setNearbyTrash] = useState<SpawnedTrash | null>(null);

  // Define World Obstacles (Buildings, Fences, Garden Plots)
  const obstaclesRef = useRef<Obstacle[]>([
    // Building top (School / Hall / Pavilion)
    { x: 50, y: 40, w: 230, h: 110 },
    // TPS 3R station shelter
    { x: 330, y: 160, w: 140, h: 60 },
    // Garden plot left
    { x: 60, y: 380, w: 160, h: 100 },
    // Garden plot right / bleachers
    { x: 580, y: 380, w: 160, h: 100 },
    // Top right shed / pond
    { x: 560, y: 50, w: 180, h: 100 }
  ]);

  // Spawn cooldown to avoid accidental trigger from menu button press
  const spawnGracePeriodRef = useRef(Date.now() + 600);

  // Initial Trash Spawn based on Level
  useEffect(() => {
    // Reset player position safely away from TPS 3R station shelter (Courtyard path)
    playerPosRef.current = { x: 380, y: 380 };
    floatTextsRef.current = [];
    spawnGracePeriodRef.current = Date.now() + 600;

    const initialItems: SpawnedTrash[] = [];
    const validTrash = TRASH_ITEMS.filter((item) =>
      level.allowed_categories.includes(item.kategori_id)
    );

    // Coordinate spawn points across the map (walkable paths)
    const spawnPoints = [
      { x: 140, y: 220 },
      { x: 220, y: 280 },
      { x: 480, y: 240 },
      { x: 540, y: 310 },
      { x: 380, y: 380 },
      { x: 260, y: 440 },
      { x: 490, y: 450 },
      { x: 120, y: 310 },
      { x: 680, y: 230 },
      { x: 680, y: 340 },
      { x: 320, y: 470 },
      { x: 430, y: 300 }
    ];

    // Pick 8-10 random items
    const count = level.level_id === 1 ? 8 : level.level_id === 2 ? 10 : 12;
    const shuffledPoints = [...spawnPoints].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count && i < shuffledPoints.length; i++) {
      // Pick random trash
      const randItem = validTrash[Math.floor(Math.random() * validTrash.length)];
      if (randItem) {
        initialItems.push({
          id: `trash_${level.level_id}_${i}_${Date.now()}`,
          item: randItem,
          x: shuffledPoints[i].x,
          y: shuffledPoints[i].y,
          collected: false,
          spawnTime: Date.now()
        });
      }
    }

    setSpawnedTrash(initialItems);
  }, [level]);

  // Continuous background respawn when items are collected
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (isPaused || isSortingOpen) return;

      const current = spawnedTrashRef.current;
      const uncollectedCount = current.filter((t) => !t.collected).length;

      if (uncollectedCount < 8) {
        const validTrash = TRASH_ITEMS.filter((item) =>
          level.allowed_categories.includes(item.kategori_id)
        );
        const randItem = validTrash[Math.floor(Math.random() * validTrash.length)];

        // Find a random walkable location
        let rx = 80 + Math.random() * (WORLD_WIDTH - 160);
        let ry = 180 + Math.random() * (WORLD_HEIGHT - 260);

        // avoid collision with obstacles
        const inObstacle = obstaclesRef.current.some(
          (obs) => rx > obs.x - 20 && rx < obs.x + obs.w + 20 && ry > obs.y - 20 && ry < obs.y + obs.h + 20
        );

        if (!inObstacle) {
          const newItem: SpawnedTrash = {
            id: `trash_spawn_${Date.now()}_${Math.random()}`,
            item: randItem,
            x: Math.floor(rx),
            y: Math.floor(ry),
            collected: false,
            spawnTime: Date.now()
          };
          setSpawnedTrash((prev) => [...prev, newItem]);
        }
      }
    }, 2800);

    return () => clearInterval(spawnInterval);
  }, [isPaused, isSortingOpen, level]);

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyE'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressedRef.current[e.code] = true;

      // Space or E: Action (Pickup trash or open TPS)
      if (e.code === 'Space' || e.code === 'KeyE') {
        handleActionTrigger();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inventory, isNearTPS, nearbyTrash, isSortingOpen, isPaused]);

  // Action Button Trigger (Pick up trash or Open TPS)
  const handleActionTrigger = useCallback(() => {
    if (isSortingOpen || isPaused) return;
    if (Date.now() < spawnGracePeriodRef.current) return;

    // Check TPS Proximity first
    if (isNearTPS) {
      soundManager.playClick();
      gamepadManager.vibrate(80, 0.3, 0.3);
      onOpenTPS();
      return;
    }

    // Check Nearest Trash Item Proximity
    if (nearbyTrash) {
      const picked = onPickupTrash(nearbyTrash.item);
      if (picked) {
        soundManager.playPickup();
        gamepadManager.vibrate(120, 0.5, 0.5);
        // Remove from world
        setSpawnedTrash((prev) =>
          prev.map((t) => (t.id === nearbyTrash.id ? { ...t, collected: true } : t))
        );
        // Floating text
        floatTextsRef.current.push({
          id: Date.now() + Math.random(),
          x: playerPosRef.current.x + 16,
          y: playerPosRef.current.y - 10,
          text: `+${nearbyTrash.item.nama_sampah}`,
          color:
            nearbyTrash.item.kategori_id === 'Organik'
              ? '#2ed573'
              : nearbyTrash.item.kategori_id === 'Anorganik'
              ? '#ffa502'
              : '#ff4757',
          opacity: 1,
          vy: -1.2
        });
      } else {
        // Inventory full
        soundManager.playWrong();
        gamepadManager.vibrate(250, 0.8, 0.2);
        floatTextsRef.current.push({
          id: Date.now() + Math.random(),
          x: playerPosRef.current.x + 16,
          y: playerPosRef.current.y - 10,
          text: 'Tas Penuh! Setor ke TPS 3R!',
          color: '#ff4757',
          opacity: 1,
          vy: -1
        });
      }
    }
  }, [isNearTPS, nearbyTrash, onPickupTrash, onOpenTPS, isSortingOpen, isPaused]);

  // Gamepad active status state
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('');

  // Main Canvas Render and Game Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastStepTime = 0;
    let stepCount = 0;
    let prevButtonA = false;
    let prevButtonX = false;

    const checkCollision = (nx: number, ny: number) => {
      // Boundaries
      if (nx < 20 || nx > WORLD_WIDTH - 50 || ny < 40 || ny > WORLD_HEIGHT - 60) {
        return true;
      }
      // Obstacles
      const playerBox = { x: nx + 6, y: ny + 16, w: 20, h: 22 };
      for (const obs of obstaclesRef.current) {
        if (
          playerBox.x < obs.x + obs.w &&
          playerBox.x + playerBox.w > obs.x &&
          playerBox.y < obs.y + obs.h &&
          playerBox.y + playerBox.h > obs.y
        ) {
          return true;
        }
      }
      return false;
    };

    const loop = (timestamp: number) => {
      if (!ctx) return;

      // Poll Gamepad
      const gp = gamepadManager.poll();
      if (gp.connected !== gamepadConnected) {
        setGamepadConnected(gp.connected);
        setGamepadName(gamepadManager.getControllerLabel());
      }

      // Handle Gamepad button single triggers
      if (gp.connected && !isPaused && !isSortingOpen) {
        if (gp.buttons.a && !prevButtonA) {
          handleActionTrigger();
        }
        if (gp.buttons.x && !prevButtonX) {
          if (isNearTPS) {
            soundManager.playClick();
            onOpenTPS();
          }
        }
      }
      prevButtonA = gp.buttons.a;
      prevButtonX = gp.buttons.x;

      // 1. Update Player Movement (Speed = 3.4 px/frame)
      if (!isPaused && !isSortingOpen) {
        const speed = 3.4;
        let dx = 0;
        let dy = 0;
        const keys = keysPressedRef.current;

        // Keyboard inputs
        if (keys['ArrowUp'] || keys['KeyW']) dy -= speed;
        if (keys['ArrowDown'] || keys['KeyS']) dy += speed;
        if (keys['ArrowLeft'] || keys['KeyA']) dx -= speed;
        if (keys['ArrowRight'] || keys['KeyD']) dx += speed;

        // Gamepad Joystick / D-Pad inputs
        if (gp.connected) {
          if (Math.abs(gp.axes.x) > 0.15) {
            dx += gp.axes.x * speed;
          }
          if (Math.abs(gp.axes.y) > 0.15) {
            dy += gp.axes.y * speed;
          }
        }

        if (dx !== 0 && dy !== 0) {
          // Normalize diagonal
          dx *= 0.7071;
          dy *= 0.7071;
        }

        if (dx !== 0 || dy !== 0) {
          isMovingRef.current = true;
          if (Math.abs(dx) > Math.abs(dy)) {
            playerDirRef.current = dx > 0 ? 'right' : 'left';
          } else {
            playerDirRef.current = dy > 0 ? 'down' : 'up';
          }

          const currentX = playerPosRef.current.x;
          const currentY = playerPosRef.current.y;

          // Try moving X
          if (!checkCollision(currentX + dx, currentY)) {
            playerPosRef.current.x += dx;
          }
          // Try moving Y
          if (!checkCollision(playerPosRef.current.x, currentY + dy)) {
            playerPosRef.current.y += dy;
          }

          // Walk animation step
          stepCount++;
          if (stepCount % 8 === 0) {
            walkFrameRef.current = (walkFrameRef.current + 1) % 4;
            if (timestamp - lastStepTime > 260) {
              soundManager.playStep();
              lastStepTime = timestamp;
            }
          }
        } else {
          isMovingRef.current = false;
        }

        // 2. Check TPS 3R Proximity
        const px = playerPosRef.current.x + 16;
        const py = playerPosRef.current.y + 20;
        const tpsCenterX = tpsPos.x + tpsPos.w / 2;
        const tpsCenterY = tpsPos.y + tpsPos.h / 2;
        const distToTPS = Math.hypot(px - tpsCenterX, py - tpsCenterY);
        const nearTPS = distToTPS < 105;
        setIsNearTPS(nearTPS);

        // 3. Check Nearest Trash Item Proximity (Radius expanded to 62px for kids)
        let closestItem: SpawnedTrash | null = null;
        let closestDist = 62;

        spawnedTrashRef.current.forEach((item) => {
          if (item.collected) return;
          const itemCenterX = item.x + 18;
          const itemCenterY = item.y + 16;
          const dist = Math.hypot(px - itemCenterX, py - itemCenterY);
          if (dist < closestDist) {
            closestDist = dist;
            closestItem = item;
          }
        });
        setNearbyTrash(closestItem);
      }

      // 4. DRAWING PHASE
      ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // A. Ground Tiles (Grass & Dirt Paths)
      const tileSize = 32;
      for (let tx = 0; tx < WORLD_WIDTH; tx += tileSize) {
        for (let ty = 0; ty < WORLD_HEIGHT; ty += tileSize) {
          // Cobblestone / Dirt walkway cross in center
          const isCenterPath =
            (tx >= 270 && tx <= 510 && ty >= 120 && ty <= 480) ||
            (ty >= 240 && ty <= 350 && tx >= 40 && tx <= 740);

          if (isCenterPath) {
            PixelMapRenderer.drawTile(ctx, 'dirt', tx, ty, tileSize);
          } else {
            PixelMapRenderer.drawTile(ctx, 'grass', tx, ty, tileSize);
          }
        }
      }

      // B. Garden Plots (Vegetables & Crops matching reference image)
      // Left Garden
      PixelMapRenderer.drawTile(ctx, 'crop_dark', 70, 390, 60);
      PixelMapRenderer.drawTile(ctx, 'crop_dark', 140, 390, 60);
      // Small crops
      for (let cx = 80; cx < 190; cx += 22) {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(cx, 405, 8, 8);
        ctx.fillStyle = '#e67e22'; // Carrot / Pumpkin
        ctx.fillRect(cx + 2, 420, 10, 10);
      }

      // Right Garden / Field
      PixelMapRenderer.drawTile(ctx, 'crop_dark', 590, 390, 60);
      PixelMapRenderer.drawTile(ctx, 'crop_dark', 660, 390, 60);
      for (let cx = 600; cx < 710; cx += 22) {
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(cx, 405, 10, 9);
        ctx.fillStyle = '#f1c40f'; // Corn / Melon
        ctx.fillRect(cx + 2, 422, 9, 9);
      }

      // C. Fences around plots
      ctx.fillStyle = '#8b5a2b';
      for (let fx = 50; fx < 220; fx += 16) {
        ctx.fillRect(fx, 376, 12, 6);
        ctx.fillRect(fx + 4, 372, 4, 12);
      }
      for (let fx = 570; fx < 740; fx += 16) {
        ctx.fillRect(fx, 376, 12, 6);
        ctx.fillRect(fx + 4, 372, 4, 12);
      }

      // D. Main Location Building (School / Hall / Pos)
      const buildingTitle =
        level.level_id === 1
          ? 'SD N SARWADADI'
          : level.level_id === 2
          ? 'BALAI DESA'
          : 'LAPANGAN DESA';
      const buildingType = level.level_id === 1 ? 'school' : level.level_id === 2 ? 'hall' : 'poskamling';

      PixelMapRenderer.drawBuilding(ctx, 50, 30, 230, 120, buildingTitle, buildingType);

      // Flagpole near school / hall
      PixelMapRenderer.drawIndonesianFlag(ctx, 290, 70);

      // E. Surrounding Trees
      PixelMapRenderer.drawTree(ctx, 10, 180, false);
      PixelMapRenderer.drawTree(ctx, 10, 270, true);
      PixelMapRenderer.drawTree(ctx, 740, 180, false);
      PixelMapRenderer.drawTree(ctx, 740, 270, true);
      PixelMapRenderer.drawTree(ctx, 570, 40, true);
      PixelMapRenderer.drawTree(ctx, 670, 40, false);

      // F. TPS 3R Hub Station
      const nearTPS = Math.hypot(
        playerPosRef.current.x + 16 - (tpsPos.x + tpsPos.w / 2),
        playerPosRef.current.y + 20 - (tpsPos.y + tpsPos.h / 2)
      ) < 105;

      PixelMapRenderer.drawTPSHub(ctx, tpsPos.x, tpsPos.y, nearTPS);

      // G. Spawned Trash Items on Map (Enlarged and highlighted)
      spawnedTrashRef.current.forEach((t) => {
        if (!t.collected) {
          PixelMapRenderer.drawTrashItem(
            ctx,
            t.x,
            t.y,
            t.item.pixelSprite,
            t.item.kategori_id,
            timestamp,
            t.item.icon,
            t.item.nama_sampah
          );

          // If this trash is closest, draw a retro bouncing arrow & selector target above it
          if (nearbyTrash && nearbyTrash.id === t.id) {
            const arrowBob = Math.sin(timestamp / 130) * 4;
            const targetX = t.x + 18;
            const targetY = t.y - 18 + arrowBob;

            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(targetX, targetY);
            ctx.lineTo(targetX - 9, targetY - 12);
            ctx.lineTo(targetX + 9, targetY - 12);
            ctx.closePath();
            ctx.fill();

            // Glowing target circle around item
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(t.x + 18, t.y + 16, 26, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });

      // H. Draw Player Character
      PixelMapRenderer.drawPlayer(
        ctx,
        playerPosRef.current.x,
        playerPosRef.current.y,
        playerDirRef.current,
        isMovingRef.current,
        walkFrameRef.current,
        inventory.length,
        player.nama || 'Pemain',
        player.jenis_kelamin
      );

      // I. Update and Draw Floating Popup Texts
      floatTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.opacity -= 0.02;
      });
      floatTextsRef.current = floatTextsRef.current.filter((ft) => ft.opacity > 0);
      PixelMapRenderer.drawFloatingTexts(ctx, floatTextsRef.current);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [inventory, isPaused, isSortingOpen, level, player, nearbyTrash, handleActionTrigger, onOpenTPS]);

  // Touch / Mobile D-Pad Handlers
  const handleDPadPress = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };
    keysPressedRef.current[keyMap[dir]] = pressed;
  };

  // Canvas Click / Tap to Move or Action
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSortingOpen || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WORLD_WIDTH / rect.width;
    const scaleY = WORLD_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on TPS Hub
    if (
      clickX >= tpsPos.x &&
      clickX <= tpsPos.x + tpsPos.w &&
      clickY >= tpsPos.y &&
      clickY <= tpsPos.y + tpsPos.h + 20
    ) {
      if (isNearTPS) {
        onOpenTPS();
      }
    }

    // Check if clicked near trash
    spawnedTrashRef.current.forEach((t) => {
      if (!t.collected && Math.hypot(clickX - (t.x + 18), clickY - (t.y + 16)) < 48) {
        if (Math.hypot(playerPosRef.current.x - t.x, playerPosRef.current.y - t.y) < 70) {
          handleActionTrigger();
        }
      }
    });
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* 2D Pixel Canvas Container with Retro Wood Border Frame */}
      <div className="relative w-full max-w-4xl aspect-[16/11] bg-[#162117] rounded-xl p-2 pixel-box-wood shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={WORLD_WIDTH}
          height={WORLD_HEIGHT}
          onClick={handleCanvasClick}
          className="w-full h-full rounded bg-[#4fa135] pixelated cursor-crosshair block"
        />

        {/* Gamepad Connection Badge (Top-Left overlay) */}
        {gamepadConnected && (
          <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-emerald-500/60 text-[10px] font-pixel text-emerald-300 flex items-center gap-2 animate-pulse">
            <span className="text-base">🎮</span>
            <span>{gamepadName.toUpperCase()}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        )}

        {/* Action Prompt Banner Overlay (Pilah Sampah / Ambil Sampah) */}
        {(isNearTPS || nearbyTrash) && !isSortingOpen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {isNearTPS ? (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenTPS();
                }}
                className="pixel-btn pixel-btn-green px-5 py-2.5 rounded-lg text-xs font-pixel flex items-center gap-2 shadow-2xl animate-pulse"
              >
                <span className="text-base">🏛️</span>
                <span>
                  {gamepadConnected ? '[X / ⬜ / E]' : '[E / KLIK]'} PILAH SAMPAH TPS 3R
                </span>
                {inventory.length > 0 && (
                  <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded text-[10px] font-bold">
                    {inventory.length} Item
                  </span>
                )}
              </button>
            ) : nearbyTrash ? (
              <button
                onClick={handleActionTrigger}
                className="pixel-btn pixel-btn-amber px-5 py-2.5 rounded-lg text-xs font-pixel flex items-center gap-2 shadow-2xl animate-bounce"
              >
                <span className="text-lg">{nearbyTrash.item.icon}</span>
                <span>
                  {gamepadConnected ? '[A / ✕ / SPASI]' : '[SPASI]'} AMBIL {nearbyTrash.item.nama_sampah.toUpperCase()}
                </span>
              </button>
            ) : null}
          </div>
        )}

        {/* Floating Mini Legend Badge on Canvas */}
        <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-xs px-3 py-1.5 rounded-md border border-white/20 text-[10px] font-pixel text-slate-200 flex items-center gap-3 pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#2ed573] inline-block shadow-sm"></span>
            Organik (100)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#ffa502] inline-block shadow-sm"></span>
            Anorganik (250)
          </span>
          {level.allowed_categories.includes('B3') && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#ff4757] inline-block shadow-sm"></span>
              B3 (500)
            </span>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Virtual Controller (On-Screen D-Pad & Action Buttons) */}
      <div className="w-full max-w-4xl mt-3 grid grid-cols-2 gap-4 px-2 sm:hidden">
        {/* D-Pad Buttons */}
        <div className="flex flex-col items-center justify-center">
          <button
            onTouchStart={() => handleDPadPress('up', true)}
            onTouchEnd={() => handleDPadPress('up', false)}
            onMouseDown={() => handleDPadPress('up', true)}
            onMouseUp={() => handleDPadPress('up', false)}
            className="w-12 h-12 pixel-btn pixel-btn-gray rounded text-lg font-bold flex items-center justify-center mb-1 text-yellow-300 shadow-md"
            title="Atas / Segitiga [▲]"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onTouchStart={() => handleDPadPress('left', true)}
              onTouchEnd={() => handleDPadPress('left', false)}
              onMouseDown={() => handleDPadPress('left', true)}
              onMouseUp={() => handleDPadPress('left', false)}
              className="w-12 h-12 pixel-btn pixel-btn-gray rounded text-base font-bold flex items-center justify-center shadow-md text-slate-200"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleDPadPress('down', true)}
              onTouchEnd={() => handleDPadPress('down', false)}
              onMouseDown={() => handleDPadPress('down', true)}
              onMouseUp={() => handleDPadPress('down', false)}
              className="w-12 h-12 pixel-btn pixel-btn-gray rounded text-base font-bold flex items-center justify-center shadow-md text-slate-200"
            >
              ▼
            </button>
            <button
              onTouchStart={() => handleDPadPress('right', true)}
              onTouchEnd={() => handleDPadPress('right', false)}
              onMouseDown={() => handleDPadPress('right', true)}
              onMouseUp={() => handleDPadPress('right', false)}
              className="w-12 h-12 pixel-btn pixel-btn-gray rounded text-base font-bold flex items-center justify-center shadow-md text-slate-200"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={handleActionTrigger}
            className="w-full py-3 pixel-btn pixel-btn-amber rounded-lg text-xs font-pixel flex items-center justify-center gap-1.5"
          >
            <span>🖐️</span>
            <span>AMBIL / AKSI</span>
          </button>
          <button
            onClick={() => {
              if (isNearTPS) {
                soundManager.playClick();
                onOpenTPS();
              }
            }}
            disabled={!isNearTPS}
            className={`w-full py-3 pixel-btn rounded-lg text-xs font-pixel flex items-center justify-center gap-1.5 ${
              isNearTPS ? 'pixel-btn-green' : 'pixel-btn-gray opacity-50'
            }`}
          >
            <span>🏛️</span>
            <span>SETOR TPS 3R</span>
          </button>
        </div>
      </div>
    </div>
  );
};
