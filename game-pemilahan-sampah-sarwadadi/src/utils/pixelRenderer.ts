// Pixel Art Canvas Engine & Asset Drawing Utilities

export interface EntityPos {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  vy: number;
}

export class PixelMapRenderer {
  // Draw detailed retro pixel art tile patterns
  public static drawTile(
    ctx: CanvasRenderingContext2D,
    type: 'grass' | 'dirt' | 'stone' | 'crop_dark' | 'crop_light' | 'field_grass',
    x: number,
    y: number,
    size: number
  ) {
    ctx.save();
    if (type === 'grass') {
      ctx.fillStyle = '#4fa135';
      ctx.fillRect(x, y, size, size);
      // Grass blades texture
      ctx.fillStyle = '#65bf43';
      ctx.fillRect(x + 4, y + 4, 3, 5);
      ctx.fillRect(x + 18, y + 14, 3, 5);
      ctx.fillRect(x + 10, y + 22, 3, 4);
      ctx.fillStyle = '#3a7d25';
      ctx.fillRect(x + 5, y + 9, 2, 2);
      ctx.fillRect(x + 22, y + 6, 2, 2);
    } else if (type === 'field_grass') {
      ctx.fillStyle = '#3e8e2b';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#4da837';
      ctx.fillRect(x + 8, y + 8, 4, 4);
      ctx.fillRect(x + 20, y + 18, 4, 4);
    } else if (type === 'dirt') {
      ctx.fillStyle = '#d99b4b';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#e8b264';
      ctx.fillRect(x + 3, y + 3, 6, 4);
      ctx.fillRect(x + 16, y + 18, 8, 5);
      ctx.fillStyle = '#b57930';
      ctx.fillRect(x + 12, y + 8, 4, 3);
      ctx.fillRect(x + 22, y + 2, 3, 3);
    } else if (type === 'stone') {
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(x + 4, y + size - 4, size - 6, 2);
      ctx.fillRect(x + size - 4, y + 4, 2, size - 6);
    } else if (type === 'crop_dark') {
      ctx.fillStyle = '#5c3317';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#40210b';
      ctx.fillRect(x + 2, y + size / 2, size - 4, 3);
    }
    ctx.restore();
  }

  // Draw Pixel Tree (Pine or Deciduous)
  public static drawTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isPine: boolean = false
  ) {
    ctx.save();
    // Tree shadow
    ctx.fillStyle = 'rgba(15, 35, 15, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 60, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#5a3014';
    ctx.fillRect(x + 18, y + 36, 12, 26);
    ctx.fillStyle = '#3c1d09';
    ctx.fillRect(x + 26, y + 36, 4, 26);

    if (isPine) {
      // 3 Tiers of Pine Foliage
      const foliage = [
        { y: y + 22, w: 42, h: 20 },
        { y: y + 10, w: 34, h: 18 },
        { y: y - 2, w: 24, h: 16 }
      ];
      foliage.forEach((tier) => {
        ctx.fillStyle = '#1e5f35';
        ctx.fillRect(x + 24 - tier.w / 2, tier.y, tier.w, tier.h);
        ctx.fillStyle = '#2b824a';
        ctx.fillRect(x + 24 - tier.w / 2 + 3, tier.y + 2, tier.w - 8, tier.h - 6);
        ctx.fillStyle = '#41a864';
        ctx.fillRect(x + 24 - tier.w / 2 + 5, tier.y + 3, 6, 4);
      });
    } else {
      // Rounded Deciduous Foliage
      ctx.fillStyle = '#2d7a2d';
      ctx.beginPath();
      ctx.arc(x + 24, y + 22, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3ea03e';
      ctx.beginPath();
      ctx.arc(x + 20, y + 18, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#59c759';
      ctx.beginPath();
      ctx.arc(x + 16, y + 14, 11, 0, Math.PI * 2);
      ctx.fill();

      // Little fruit/apple spots
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + 12, y + 18, 4, 4);
      ctx.fillRect(x + 28, y + 10, 4, 4);
      ctx.fillRect(x + 32, y + 26, 4, 4);
    }
    ctx.restore();
  }

  // Draw Indonesian School / Village Hall Building in Retro Pixel Art
  public static drawBuilding(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    buildingType: 'school' | 'hall' | 'poskamling'
  ) {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 8, y + h - 6, w + 10, 14);

    // Main Wall Base
    if (buildingType === 'school') {
      ctx.fillStyle = '#f5ecd7'; // Cream wall
      ctx.fillRect(x, y + 36, w, h - 36);
      ctx.fillStyle = '#4a90e2'; // Blue school lower wall trim
      ctx.fillRect(x, y + h - 22, w, 22);
    } else if (buildingType === 'hall') {
      ctx.fillStyle = '#deb887'; // Wooden beam Balai Desa
      ctx.fillRect(x, y + 36, w, h - 36);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(x, y + h - 16, w, 16);
    } else {
      ctx.fillStyle = '#c89666';
      ctx.fillRect(x, y + 24, w, h - 24);
    }

    // Roof (Terracotta Tiles)
    const roofOverhang = 12;
    ctx.fillStyle = '#c0392b'; // Dark Terracotta
    ctx.fillRect(x - roofOverhang, y, w + roofOverhang * 2, 40);

    // Roof Tile Highlights & Lines
    ctx.fillStyle = '#e74c3c';
    for (let ry = y + 4; ry < y + 36; ry += 8) {
      for (let rx = x - roofOverhang + 4; rx < x + w + roofOverhang - 8; rx += 14) {
        ctx.fillRect(rx, ry, 10, 5);
      }
    }
    ctx.fillStyle = '#78281f';
    ctx.fillRect(x - roofOverhang, y + 38, w + roofOverhang * 2, 4);

    // Windows with Glass Shine
    const windowCount = Math.floor(w / 50);
    for (let i = 0; i < windowCount; i++) {
      const wx = x + 16 + i * 48;
      const wy = y + 48;
      if (wx + 28 < x + w - 36) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(wx, wy, 26, 26);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(wx + 2, wy + 2, 10, 10);
        ctx.fillRect(wx + 14, wy + 2, 10, 10);
        ctx.fillRect(wx + 2, wy + 14, 10, 10);
        ctx.fillRect(wx + 14, wy + 14, 10, 10);
        // Window light reflection
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx + 4, wy + 4, 3, 3);
      }
    }

    // Main Door
    const doorX = x + w / 2 - 16;
    const doorY = y + h - 38;
    ctx.fillStyle = '#4a2d11';
    ctx.fillRect(doorX, doorY, 32, 38);
    ctx.fillStyle = '#7a4b1c';
    ctx.fillRect(doorX + 3, doorY + 3, 11, 32);
    ctx.fillRect(doorX + 17, doorY + 3, 11, 32);
    // Door knob
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(doorX + 12, doorY + 18, 3, 3);

    // Signboard on building
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(x + w / 2 - 65, y + 26, 130, 18);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w / 2 - 65, y + 26, 130, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 38);

    ctx.restore();
  }

  // Draw Indonesian Flag (Merah Putih) on Pole
  public static drawIndonesianFlag(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Base
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x - 6, y + 60, 14, 8);
    // Pole
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(x, y, 3, 60);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x - 2, y - 4, 7, 5); // Golden ball topper

    // Flag flapping animation offset
    const wave = Math.sin(Date.now() / 200) * 2;
    // Red top
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x + 3, y + 4, 24, 9 + wave * 0.4);
    // White bottom
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, y + 13 + wave * 0.4, 24, 9 - wave * 0.4);
    ctx.restore();
  }

  // Draw TPS 3R Hub Station with 3 Color-Coded Bins
  public static drawTPSHub(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isNearPlayer: boolean
  ) {
    ctx.save();
    // Foundation shadow & concrete pad
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x - 4, y + 60, 140, 16);

    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x - 6, y + 30, 144, 38);
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(x - 4, y + 32, 140, 34);

    // Roof shelter
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x - 10, y - 6, 152, 14);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(x - 8, y - 4, 148, 10);
    // Support posts
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x - 4, y + 8, 6, 26);
    ctx.fillRect(x + 130, y + 8, 6, 26);

    // TPS 3R Header Badge
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x + 14, y - 18, 104, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TPS 3R SARWADADI', x + 66, y - 6);

    // 3 Color-Coded Sorting Bins
    const bins = [
      { name: 'ORGANIK', color: '#2ed573', border: '#10ac84', x: x + 6, icon: '🍃' },
      { name: 'ANORGANIK', color: '#ffa502', border: '#e67e22', x: x + 48, icon: '📦' },
      { name: 'B3', color: '#ff4757', border: '#c0392b', x: x + 90, icon: '☣️' }
    ];

    bins.forEach((bin) => {
      // Bin Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(bin.x + 2, y + 54, 36, 6);

      // Bin Body
      ctx.fillStyle = bin.border;
      ctx.fillRect(bin.x, y + 26, 38, 30);
      ctx.fillStyle = bin.color;
      ctx.fillRect(bin.x + 2, y + 28, 34, 26);

      // Bin Lid
      ctx.fillStyle = bin.border;
      ctx.fillRect(bin.x - 2, y + 22, 42, 6);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(bin.name.slice(0, 4), bin.x + 19, y + 42);

      // 3R recycle logo symbol
      ctx.fillText('♻️', bin.x + 19, y + 51);
    });

    // Pulsing "SETOR SAMPAH" beacon when player is near
    if (isNearPlayer) {
      const pulse = Math.abs(Math.sin(Date.now() / 250));
      ctx.fillStyle = `rgba(255, 230, 0, ${0.4 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(x + 66, y + 40, 60 + pulse * 8, 0, Math.PI * 2);
      ctx.fill();

      // Callout prompt
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + 20, y - 36, 92, 16);
      ctx.fillStyle = '#000000';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('▶ PILAH SAMPAH', x + 66, y - 25);
    }

    ctx.restore();
  }

  // Draw Animated Player Character (4 Directions, walking frames, carrying backpack/stack)
  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: 'down' | 'up' | 'left' | 'right',
    isMoving: boolean,
    walkFrame: number,
    carriedCount: number,
    playerName: string,
    gender: 'L' | 'P' = 'L'
  ) {
    ctx.save();
    // Shadow under player feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 36, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const frameOffset = isMoving ? (walkFrame % 2 === 0 ? -2 : 2) : 0;

    // Body Colors (School Uniform / Scout Style)
    const shirtColor = gender === 'L' ? '#ffffff' : '#ffffff';
    const pantsColor = '#c0392b'; // Merah SD
    const skinColor = '#fcd5b5';
    const hairColor = gender === 'L' ? '#3d2314' : '#1a1a1a';
    const hatColor = '#d35400'; // SD Red cap

    // Legs / Feet
    ctx.fillStyle = pantsColor;
    if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 12 + frameOffset, y + 26, 8, 9);
      ctx.fillStyle = '#2c3e50'; // Shoes
      ctx.fillRect(x + 11 + frameOffset, y + 33, 10, 4);
    } else {
      ctx.fillRect(x + 10 + frameOffset, y + 26, 5, 9);
      ctx.fillRect(x + 17 - frameOffset, y + 26, 5, 9);
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(x + 9 + frameOffset, y + 33, 6, 4);
      ctx.fillRect(x + 17 - frameOffset, y + 33, 6, 4);
    }

    // Torso / Shirt
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + 9, y + 16, 14, 11);
    // Red tie / belt
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x + 15, y + 18, 2, 8);
    ctx.fillRect(x + 9, y + 25, 14, 2);

    // Arms
    ctx.fillStyle = skinColor;
    if (direction === 'left') {
      ctx.fillRect(x + 7, y + 18 - frameOffset, 3, 7);
    } else if (direction === 'right') {
      ctx.fillRect(x + 22, y + 18 + frameOffset, 3, 7);
    } else {
      ctx.fillRect(x + 6, y + 18 + frameOffset, 3, 7);
      ctx.fillRect(x + 23, y + 18 - frameOffset, 3, 7);
    }

    // Head / Face
    ctx.fillStyle = skinColor;
    ctx.fillRect(x + 9, y + 6, 14, 11);

    // Hair
    ctx.fillStyle = hairColor;
    if (direction === 'up') {
      ctx.fillRect(x + 8, y + 4, 16, 12);
    } else {
      ctx.fillRect(x + 8, y + 4, 16, 5);
      if (gender === 'P') {
        // Ponytail / pigtails
        ctx.fillRect(x + 6, y + 7, 3, 8);
        ctx.fillRect(x + 23, y + 7, 3, 8);
      }
    }

    // Eyes
    if (direction !== 'up') {
      ctx.fillStyle = '#2c3e50';
      if (direction === 'left') {
        ctx.fillRect(x + 10, y + 10, 2, 3);
      } else if (direction === 'right') {
        ctx.fillRect(x + 19, y + 10, 2, 3);
      } else {
        ctx.fillRect(x + 12, y + 10, 2, 3);
        ctx.fillRect(x + 18, y + 10, 2, 3);
        // Smile
        ctx.fillStyle = '#d35400';
        ctx.fillRect(x + 14, y + 14, 4, 1);
      }
    }

    // Cap / Hat (Indonesian SD Hat)
    ctx.fillStyle = hatColor;
    ctx.fillRect(x + 8, y + 2, 16, 4);
    if (direction !== 'up') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 14, y + 2, 4, 3); // Hat emblem
    }

    // Carried Waste Indicator (Pixel Stack / Bag on back)
    if (carriedCount > 0) {
      // Bag/Basket on back
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(x + 7, y - 6, 18, 9);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 7, y - 6, 18, 9);

      // Carried count badge
      ctx.fillStyle = '#f1c40f';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${carriedCount}🗑️`, x + 16, y + 1);
    }

    // Player Name Tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 16 - 28, y - 16, 56, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(playerName.slice(0, 8), x + 16, y - 9);

    ctx.restore();
  }

  // Draw Large, Highly-Visible Pixel Trash Item in World with Bobbing, Glow Halo & Clear Category Badge
  public static drawTrashItem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    spriteKey: string,
    category: 'Organik' | 'Anorganik' | 'B3',
    time: number,
    iconEmoji: string = '🗑️',
    name: string = ''
  ) {
    ctx.save();
    const bob = Math.sin((time + x * 10) / 220) * 4;
    const drawY = y + bob;
    const pulse = Math.abs(Math.sin(time / 200));

    // 1. Large Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 30, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-Contrast Category Glow Halo (Expanded for Kids)
    const glowBase =
      category === 'Organik'
        ? { halo: 'rgba(46, 213, 115, 0.45)', stroke: '#2ed573', bg: '#0d381e', text: '#2ed573' }
        : category === 'Anorganik'
        ? { halo: 'rgba(255, 165, 2, 0.45)', stroke: '#ffa502', bg: '#3a2505', text: '#ffa502' }
        : { halo: 'rgba(255, 71, 87, 0.55)', stroke: '#ff4757', bg: '#3a0c10', text: '#ff4757' };

    // Pulsing outer aura ring
    ctx.fillStyle = glowBase.halo;
    ctx.beginPath();
    ctx.arc(x + 18, drawY + 16, 22 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();

    // Solid category circular pedestal platform
    ctx.fillStyle = glowBase.bg;
    ctx.strokeStyle = glowBase.stroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x + 18, drawY + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Render Large Custom Pixel Sprite (Scale ~2.5x)
    const cx = x + 18;
    const cy = drawY + 16;

    if (spriteKey === 'banana') {
      // Big yellow banana
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 11, 0.3, Math.PI * 0.85);
      ctx.stroke();
      // Banana tips
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(cx - 10, cy + 5, 4, 4);
      ctx.fillRect(cx + 8, cy - 8, 3, 3);
    } else if (spriteKey === 'apple') {
      // Big red apple core
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(cx - 4, cy, 9, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      // Stem & Green Leaf
      ctx.fillStyle = '#795548';
      ctx.fillRect(cx - 1, cy - 12, 3, 5);
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(cx + 4, cy - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (spriteKey === 'leaves') {
      // Large autumn leaves
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(cx - 4, cy + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(cx + 4, cy - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(cx - 2, cy - 8, 4, 14);
    } else if (spriteKey === 'plastic_bottle') {
      // Big mineral water bottle
      ctx.fillStyle = '#3498db';
      ctx.fillRect(cx - 6, cy - 11, 12, 22);
      ctx.fillStyle = '#1b6ca8';
      ctx.fillRect(cx - 4, cy - 14, 8, 4); // Blue cap
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 6, cy - 2, 12, 8); // White label
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(cx - 2, cy + 1, 4, 3);
    } else if (spriteKey === 'soda_can') {
      // Big soda can
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(cx - 7, cy - 9, 14, 18);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(cx - 7, cy - 11, 14, 3); // Silver top
      ctx.fillRect(cx - 7, cy + 8, 14, 3); // Silver bottom
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 4, cy - 3, 8, 6); // Brand wave
    } else if (spriteKey === 'cardboard') {
      // Big corrugated cardboard box
      ctx.fillStyle = '#b7791f';
      ctx.fillRect(cx - 10, cy - 8, 20, 16);
      ctx.fillStyle = '#8c5310';
      ctx.fillRect(cx - 10, cy - 2, 20, 3); // Center tape
      ctx.fillStyle = '#d49b4b';
      ctx.fillRect(cx - 8, cy - 6, 6, 4);
    } else if (spriteKey === 'battery') {
      // Big radioactive / toxic battery
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(cx - 7, cy - 8, 14, 18);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(cx - 7, cy - 8, 14, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(cx - 3, cy - 12, 6, 4); // Golden positive terminal
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', cx, cy + 6);
    } else if (spriteKey === 'lightbulb') {
      // Glowing incandescent bulb
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(cx - 4, cy + 5, 8, 6); // Metal screw base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3, cy - 6, 3, 3); // Glass reflection
    } else {
      // Render the prominent high-res icon emoji as sprite fallback
      ctx.font = '16px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconEmoji, cx, cy);
    }

    // 4. Floating Category Badge Tag Above Item (Instantly clear for elementary students)
    const badgeText = category === 'Organik' ? 'ORGANIK' : category === 'Anorganik' ? 'ANORGANIK' : 'B3 BAHAYA';
    const badgeBg = category === 'Organik' ? '#1b4d29' : category === 'Anorganik' ? '#5a3806' : '#5c0f16';
    const badgeBorder = category === 'Organik' ? '#2ed573' : category === 'Anorganik' ? '#ffa502' : '#ff4757';

    ctx.fillStyle = badgeBg;
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1.5;
    ctx.fillRect(cx - 24, drawY - 14, 48, 10);
    ctx.strokeRect(cx - 24, drawY - 14, 48, 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, cx, drawY - 7);

    // 5. Sparkles on B3 and Rare items
    if (category === 'B3') {
      const sparkle = (time / 140) % 4;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(cx - 16 + sparkle * 8, drawY - 8, 3, 3);
      ctx.fillRect(cx + 14 - sparkle * 6, drawY + 16, 3, 3);
    }

    ctx.restore();
  }

  // Draw Floating Text (e.g. "+100 Koin!", "+250 Koin!")
  public static drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatText[]) {
    ctx.save();
    texts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      // Dark text shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
    });
    ctx.restore();
  }
}
