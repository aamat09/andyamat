import { roundRect } from './ui';

/** Toy Story iconic cloud wallpaper — blue wall with puffy white clouds in a grid. */
export function drawCloudWallpaper(ctx: CanvasRenderingContext2D, W: number, H: number, wallH: number) {
  // Blue wall
  ctx.fillStyle = '#5B9BD5';
  ctx.fillRect(0, 0, W, wallH);

  // Cloud pattern — 3 rows, staggered
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  const cw = 70, ch = 36;
  for (let row = 0; row < 4; row++) {
    const offsetX = row % 2 === 0 ? 0 : cw * 0.6;
    for (let col = -1; col < Math.ceil(W / cw) + 1; col++) {
      const cx = col * cw * 1.2 + offsetX;
      const cy = 40 + row * (ch * 2.2);
      if (cy > wallH - 20) continue;
      drawWallCloud(ctx, cx, cy, cw * 0.5);
    }
  }
}

function drawWallCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.beginPath();
  ctx.arc(x, y, w * 0.35, 0, Math.PI * 2);
  ctx.arc(x + w * 0.3, y - w * 0.18, w * 0.3, 0, Math.PI * 2);
  ctx.arc(x + w * 0.6, y - w * 0.06, w * 0.28, 0, Math.PI * 2);
  ctx.arc(x + w * 0.85, y + w * 0.05, w * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

/** Toy Story star wallpaper — warm cream/yellow wall with scattered orange/red stars. */
export function drawStarWallpaper(ctx: CanvasRenderingContext2D, W: number, H: number, wallH: number) {
  // Warm cream/yellow wall base
  ctx.fillStyle = '#EEDCAA';
  ctx.fillRect(0, 0, W, wallH);

  // Draw scattered orange/red stars in a semi-random grid
  ctx.fillStyle = '#E8773A';
  const cols = Math.ceil(W / 50) + 1;
  const rows = Math.ceil(wallH / 50) + 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Semi-random offset using a deterministic hash-like pattern
      const seed = row * 137 + col * 251;
      const offX = ((seed * 73) % 30) - 15;
      const offY = ((seed * 47) % 20) - 10;
      const cx = col * 50 + 25 + offX;
      const cy = row * 50 + 25 + offY;
      if (cy > wallH - 10 || cy < 5) continue;
      // Alternate star sizes between 8-15px based on position
      const size = 8 + ((seed * 31) % 8);
      // Alternate between two orange/red shades
      ctx.fillStyle = (row + col) % 2 === 0 ? '#E8773A' : '#D4652F';
      drawStar5(ctx, cx, cy, size * 0.4, size * 0.5);
    }
  }
}

function drawStar5(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerR: number, outerR: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 2) + (i * Math.PI) / 5;
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** Wooden floor with planks. */
export function drawWoodFloor(ctx: CanvasRenderingContext2D, W: number, H: number, floorY: number) {
  // Floor base
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, '#DEB887');
  floorGrad.addColorStop(1, '#C4975A');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  // Baseboard
  ctx.fillStyle = '#F5F5F0';
  ctx.fillRect(0, floorY, W, 6);

  // Plank lines
  ctx.strokeStyle = 'rgba(139,69,19,0.15)';
  ctx.lineWidth = 1;
  const plankH = 24;
  for (let y = floorY + 6 + plankH; y < H; y += plankH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/** Andy's room — wallpaper + floor + optional furniture hints. */
export function drawAndysRoom(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const floorY = H * 0.65;
  drawStarWallpaper(ctx, W, H, floorY);
  drawWoodFloor(ctx, W, H, floorY);
}

/** Andy's bedroom door scene. */
export function drawBedroomDoor(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) {
  // Dark hallway
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2C1810');
  grad.addColorStop(1, '#4A3228');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Floor in hallway
  ctx.fillStyle = '#5C4033';
  ctx.fillRect(0, H * 0.75, W, H * 0.25);

  // Door frame
  const doorW = 220;
  const doorH = H * 0.7;
  const doorX = (W - doorW) / 2;
  const doorY = H * 0.08;

  // Door frame border
  ctx.fillStyle = '#F5F5F0';
  roundRect(ctx, doorX - 12, doorY - 8, doorW + 24, doorH + 12, 4);
  ctx.fill();

  // Door itself
  ctx.fillStyle = '#E8D5B7';
  roundRect(ctx, doorX, doorY, doorW, doorH, 2);
  ctx.fill();
  ctx.strokeStyle = '#C4975A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Door panels (two rectangles)
  ctx.strokeStyle = '#C4975A';
  ctx.lineWidth = 2;
  roundRect(ctx, doorX + 20, doorY + 20, doorW - 40, doorH * 0.35, 4);
  ctx.stroke();
  roundRect(ctx, doorX + 20, doorY + doorH * 0.42, doorW - 40, doorH * 0.35, 4);
  ctx.stroke();

  // Door knob
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(doorX + doorW - 30, doorY + doorH * 0.5, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B8960C';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // "ANDY" written in wobbly kid handwriting
  ctx.save();
  ctx.fillStyle = '#4169E1';
  ctx.font = '800 32px "Nunito", sans-serif';
  ctx.textAlign = 'center';
  const andyLetters = ['A', 'N', 'D', 'Y'];
  const baseX = W / 2 - 36;
  andyLetters.forEach((letter, i) => {
    ctx.save();
    const lx = baseX + i * 24;
    const ly = doorY + doorH * 0.22;
    const wobble = Math.sin(i * 1.2 + 0.5) * 4;
    const rot = (Math.sin(i * 0.8 + 0.3) * 5) * Math.PI / 180;
    ctx.translate(lx, ly + wobble);
    ctx.rotate(rot);
    ctx.fillText(letter, 0, 0);
    ctx.restore();
  });
  ctx.restore();

  // Light spilling from under the door
  const glow = ctx.createRadialGradient(W / 2, doorY + doorH, 10, W / 2, doorY + doorH, 120);
  glow.addColorStop(0, 'rgba(255,223,100,0.3)');
  glow.addColorStop(1, 'rgba(255,223,100,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, doorY + doorH - 10, W, 50);
}

/** Pizza Planet themed map. */
export function drawPizzaPlanetMap(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  mapX: number, mapY: number, mapW: number, mapH: number,
  revealed: boolean, frame: number,
) {
  // Red & white checkered placemat
  ctx.fillStyle = '#FFF';
  roundRect(ctx, mapX, mapY, mapW, mapH, 8);
  ctx.fill();

  // Red border
  ctx.strokeStyle = '#E74C3C';
  ctx.lineWidth = 4;
  roundRect(ctx, mapX, mapY, mapW, mapH, 8);
  ctx.stroke();

  // Checkered pattern (subtle)
  const sq = 20;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, mapX + 2, mapY + 2, mapW - 4, mapH - 4, 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(231,76,60,0.08)';
  for (let r = 0; r < Math.ceil(mapH / sq); r++) {
    for (let c = 0; c < Math.ceil(mapW / sq); c++) {
      if ((r + c) % 2 === 0) {
        ctx.fillRect(mapX + c * sq, mapY + r * sq, sq, sq);
      }
    }
  }
  ctx.restore();

  // "PIZZA PLANET" header
  ctx.fillStyle = '#E74C3C';
  ctx.font = '700 14px "Fredoka One", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PIZZA PLANET', mapX + mapW / 2, mapY + 24);
  ctx.fillStyle = '#8B4513';
  ctx.font = '600 10px "Nunito", sans-serif';
  ctx.fillText('DELIVERY MAP', mapX + mapW / 2, mapY + 38);

  // Dotted route path
  ctx.strokeStyle = '#E74C3C88';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(mapX + 30, mapY + 55);
  ctx.quadraticCurveTo(mapX + mapW * 0.3, mapY + mapH * 0.6, mapX + mapW * 0.5, mapY + mapH * 0.45);
  ctx.quadraticCurveTo(mapX + mapW * 0.7, mapY + mapH * 0.3, mapX + mapW / 2, mapY + mapH * 0.7);
  ctx.stroke();
  ctx.setLineDash([]);

  // Destination marker
  if (revealed) {
    // Green star
    ctx.fillStyle = '#7CFC00';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', mapX + mapW / 2, mapY + mapH * 0.7 + 12);
  } else {
    // Pulsing Saturn/rocket icon (simplified as a circle with ring)
    const pulse = 1 + Math.sin(frame * 0.05) * 0.1;
    ctx.save();
    ctx.translate(mapX + mapW / 2, mapY + mapH * 0.7);
    ctx.scale(pulse, pulse);
    // Planet body
    ctx.fillStyle = '#9370DB';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    // Ring
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 8, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** Toy box for the gift scene. */
export function drawToyBox(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  cx: number, cy: number, opened: boolean, frame: number,
) {
  const boxW = 180;
  const boxH = 120;
  const bx = cx - boxW / 2;
  const by = cy;

  ctx.save();
  if (opened) {
    const shake = Math.sin(frame * 0.5) * Math.max(0, 20 - (frame % 100)) * 0.2;
    ctx.translate(shake, 0);
  }

  // Box body
  const boxGrad = ctx.createLinearGradient(bx, by, bx, by + boxH);
  boxGrad.addColorStop(0, '#8B4513');
  boxGrad.addColorStop(1, '#6B3410');
  ctx.fillStyle = boxGrad;
  roundRect(ctx, bx, by, boxW, boxH, 6);
  ctx.fill();
  ctx.strokeStyle = '#5C2D0C';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Wood grain lines
  ctx.strokeStyle = 'rgba(92,45,12,0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bx + 10, by + i * (boxH / 4));
    ctx.lineTo(bx + boxW - 10, by + i * (boxH / 4));
    ctx.stroke();
  }

  // "TOYS" text on front
  ctx.fillStyle = '#FFD700';
  ctx.font = '700 22px "Fredoka One", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOYS', cx, by + boxH * 0.55);

  // Lid
  if (opened) {
    // Lid tilted back
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-0.4);
    const lidGrad = ctx.createLinearGradient(0, -20, 0, 0);
    lidGrad.addColorStop(0, '#A0522D');
    lidGrad.addColorStop(1, '#8B4513');
    ctx.fillStyle = lidGrad;
    roundRect(ctx, 0, -20, boxW, 22, 4);
    ctx.fill();
    ctx.strokeStyle = '#5C2D0C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Glow from inside
    const glow = ctx.createRadialGradient(cx, by + 10, 5, cx, by + 10, 80);
    glow.addColorStop(0, 'rgba(255,223,100,0.4)');
    glow.addColorStop(1, 'rgba(255,223,100,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(bx, by - 30, boxW, 50);
  } else {
    // Lid closed
    const lidGrad = ctx.createLinearGradient(bx, by - 20, bx, by);
    lidGrad.addColorStop(0, '#A0522D');
    lidGrad.addColorStop(1, '#8B4513');
    ctx.fillStyle = lidGrad;
    roundRect(ctx, bx - 4, by - 20, boxW + 8, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#5C2D0C';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Latch
    ctx.fillStyle = '#D4AF37';
    roundRect(ctx, cx - 12, by - 10, 24, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#B8960C';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Detailed Andy's room for confirm/finale scene.
 * Based on reference sketch: desk on left, door center-back,
 * dresser with globe on right, window with shutters, wooden floor.
 * colorProgress < 0.5 = pencil mode, >= 0.5 = color fills.
 */
export function drawAndysRoomDetailed(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  colorProgress: number,
): void {
  ctx.save();

  const floorY = H * 0.62;
  const isPencil = colorProgress < 0.5;
  const colorAlpha = isPencil ? 0 : Math.min(1, (colorProgress - 0.5) / 0.4);

  const pencilStroke = () => {
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 2, 2, 2]);
  };

  const solidStroke = (color: string, width = 1.5) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash([]);
  };

  // =====================
  // WALLS — star wallpaper (cream/yellow with orange/red stars)
  // =====================
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    drawStarWallpaper(ctx, W, H, floorY);
    ctx.globalAlpha = 1;
  }
  if (isPencil) {
    // Light gray wall base for pencil mode
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, W, floorY);
  }

  // =====================
  // FLOOR — wooden planks
  // =====================
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    drawWoodFloor(ctx, W, H, floorY);
    ctx.globalAlpha = 1;
  }
  // Pencil floor planks
  if (isPencil) pencilStroke(); else solidStroke('rgba(139,69,19,0.25)', 1);
  // Floor line
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.stroke();
  // Plank lines
  const plankH = 22;
  for (let py = floorY + plankH; py < H; py += plankH) {
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
  }
  // Vertical plank seams (staggered)
  const plankW = 60;
  let row = 0;
  for (let py = floorY; py < H; py += plankH) {
    const offset = (row % 2) * (plankW / 2);
    for (let px = offset; px < W; px += plankW) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + plankH);
      ctx.stroke();
    }
    row++;
  }
  ctx.setLineDash([]);

  // =====================
  // BASEBOARD
  // =====================
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#F5F5F0';
    ctx.fillRect(0, floorY, W, 8);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#C4975A', 1.5);
  ctx.beginPath();
  ctx.moveTo(0, floorY + 8);
  ctx.lineTo(W, floorY + 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // DOOR (center-back)
  // =====================
  const doorW = 64;
  const doorH = floorY * 0.7;
  const doorX = W * 0.48 - doorW / 2;
  const doorY = floorY - doorH;

  // Door frame
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#F5F5F0';
    ctx.fillRect(doorX - 6, doorY - 4, doorW + 12, doorH + 8);
    ctx.fillStyle = '#E8D5B7';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#8B7355', 2);
  ctx.strokeRect(doorX, doorY, doorW, doorH);
  ctx.setLineDash([]);

  // Door panels
  if (isPencil) pencilStroke(); else solidStroke('#C4975A', 1.5);
  const panelInset = 8;
  const panelH = (doorH - panelInset * 3) / 2;
  ctx.strokeRect(doorX + panelInset, doorY + panelInset, doorW - panelInset * 2, panelH);
  ctx.strokeRect(doorX + panelInset, doorY + panelInset * 2 + panelH, doorW - panelInset * 2, panelH);
  ctx.setLineDash([]);

  // Door knob
  ctx.beginPath();
  ctx.arc(doorX + doorW - 12, doorY + doorH * 0.52, 3.5, 0, Math.PI * 2);
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#D4AF37';
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#B8960C', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // DESK (left side)
  // =====================
  const deskX = W * 0.04;
  const deskW = W * 0.26;
  const deskTopY = floorY - 50;
  const deskH = 50;

  // Desk surface
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#A0724E';
    ctx.fillRect(deskX, deskTopY, deskW, 6);
    // Desk legs
    ctx.fillRect(deskX + 4, deskTopY + 6, 6, deskH - 6);
    ctx.fillRect(deskX + deskW - 10, deskTopY + 6, 6, deskH - 6);
    // Shelf under desk
    ctx.fillStyle = '#B08060';
    ctx.fillRect(deskX + 8, deskTopY + 26, deskW - 16, 5);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#6B4226', 1.8);
  // Table top
  ctx.strokeRect(deskX, deskTopY, deskW, 6);
  // Legs
  ctx.beginPath();
  ctx.moveTo(deskX + 7, deskTopY + 6);
  ctx.lineTo(deskX + 7, floorY);
  ctx.moveTo(deskX + deskW - 7, deskTopY + 6);
  ctx.lineTo(deskX + deskW - 7, floorY);
  ctx.stroke();
  // Shelf
  ctx.beginPath();
  ctx.moveTo(deskX + 8, deskTopY + 28);
  ctx.lineTo(deskX + deskW - 8, deskTopY + 28);
  ctx.stroke();
  ctx.setLineDash([]);

  // Items on desk — book stack
  if (isPencil) pencilStroke(); else solidStroke('#4A4A4A', 1.2);
  const bookX = deskX + 14;
  const bookBaseY = deskTopY - 2;
  // Book 1
  ctx.strokeRect(bookX, bookBaseY - 8, 18, 8);
  if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#E74C3C'; ctx.fillRect(bookX + 1, bookBaseY - 7, 16, 6); ctx.globalAlpha = 1; }
  // Book 2
  ctx.strokeRect(bookX + 2, bookBaseY - 14, 14, 6);
  if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#3498DB'; ctx.fillRect(bookX + 3, bookBaseY - 13, 12, 4); ctx.globalAlpha = 1; }
  ctx.setLineDash([]);

  // Lamp on desk
  const lampX = deskX + deskW - 20;
  const lampBaseY = deskTopY;
  if (isPencil) pencilStroke(); else solidStroke('#4A4A4A', 1.5);
  // Lamp base
  ctx.beginPath();
  ctx.moveTo(lampX - 6, lampBaseY);
  ctx.lineTo(lampX + 6, lampBaseY);
  ctx.stroke();
  // Lamp stem
  ctx.beginPath();
  ctx.moveTo(lampX, lampBaseY);
  ctx.lineTo(lampX, lampBaseY - 22);
  ctx.stroke();
  // Lamp shade
  ctx.beginPath();
  ctx.moveTo(lampX - 10, lampBaseY - 22);
  ctx.lineTo(lampX - 6, lampBaseY - 34);
  ctx.lineTo(lampX + 6, lampBaseY - 34);
  ctx.lineTo(lampX + 10, lampBaseY - 22);
  ctx.closePath();
  if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#F0E68C'; ctx.fill(); ctx.globalAlpha = 1; }
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // DRESSER/SHELF (right side)
  // =====================
  const dresserX = W * 0.68;
  const dresserW = W * 0.18;
  const dresserH = 60;
  const dresserY = floorY - dresserH;

  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#B08060';
    ctx.fillRect(dresserX, dresserY, dresserW, dresserH);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#6B4226', 1.8);
  ctx.strokeRect(dresserX, dresserY, dresserW, dresserH);
  // Drawer lines
  const drawerH = dresserH / 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(dresserX, dresserY + i * drawerH);
    ctx.lineTo(dresserX + dresserW, dresserY + i * drawerH);
    ctx.stroke();
  }
  // Drawer knobs
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(dresserX + dresserW / 2, dresserY + i * drawerH + drawerH / 2, 2.5, 0, Math.PI * 2);
    if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#D4AF37'; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Globe on dresser
  const globeX = dresserX + dresserW / 2;
  const globeY = dresserY - 14;
  // Globe stand
  if (isPencil) pencilStroke(); else solidStroke('#8B7355', 1.5);
  ctx.beginPath();
  ctx.moveTo(globeX - 6, dresserY);
  ctx.lineTo(globeX + 6, dresserY);
  ctx.moveTo(globeX, dresserY);
  ctx.lineTo(globeX, globeY + 10);
  ctx.stroke();
  ctx.setLineDash([]);
  // Globe sphere
  ctx.beginPath();
  ctx.arc(globeX, globeY, 10, 0, Math.PI * 2);
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#5BA3D9';
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#3A7AB5', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);
  // Continent hint
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha * 0.6;
    ctx.fillStyle = '#6BBF6B';
    ctx.beginPath();
    ctx.ellipse(globeX - 2, globeY - 2, 5, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // =====================
  // WINDOW WITH SHUTTERS (right wall)
  // =====================
  const winX = W * 0.78;
  const winW = W * 0.16;
  const winY = floorY * 0.15;
  const winH = floorY * 0.38;

  // Window pane
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#ADE1F5';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#8B7355', 2);
  ctx.strokeRect(winX, winY, winW, winH);
  // Cross pane
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Window frame
  if (isPencil) pencilStroke(); else solidStroke('#F5F5F0', 3);
  ctx.strokeRect(winX - 3, winY - 3, winW + 6, winH + 6);
  ctx.setLineDash([]);

  // Shutters (left)
  const shutterW = winW * 0.22;
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#6B8EB5';
    ctx.fillRect(winX - shutterW - 4, winY - 3, shutterW, winH + 6);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#4A6A8A', 1.5);
  ctx.strokeRect(winX - shutterW - 4, winY - 3, shutterW, winH + 6);
  // Slat lines
  const slatCount = 5;
  for (let i = 1; i < slatCount; i++) {
    const sy = winY - 3 + i * ((winH + 6) / slatCount);
    ctx.beginPath();
    ctx.moveTo(winX - shutterW - 4, sy);
    ctx.lineTo(winX - 4, sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Shutters (right)
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#6B8EB5';
    ctx.fillRect(winX + winW + 4, winY - 3, shutterW, winH + 6);
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#4A6A8A', 1.5);
  ctx.strokeRect(winX + winW + 4, winY - 3, shutterW, winH + 6);
  for (let i = 1; i < slatCount; i++) {
    const sy = winY - 3 + i * ((winH + 6) / slatCount);
    ctx.beginPath();
    ctx.moveTo(winX + winW + 4, sy);
    ctx.lineTo(winX + winW + 4 + shutterW, sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // =====================
  // BEAN BAG / BED (lower right floor area)
  // =====================
  const bbX = W * 0.72;
  const bbY = floorY + 8;
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha;
    ctx.fillStyle = '#8B6FAF';
    ctx.beginPath();
    ctx.ellipse(bbX, bbY + 16, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (isPencil) pencilStroke(); else solidStroke('#6B4F8F', 1.8);
  ctx.beginPath();
  ctx.ellipse(bbX, bbY + 16, 28, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Top poof
  ctx.beginPath();
  ctx.ellipse(bbX, bbY + 4, 22, 14, 0, Math.PI, 0);
  if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#9B7FBF'; ctx.fill(); ctx.globalAlpha = 1; }
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // BUCKET on floor (left of center)
  // =====================
  const bucketX = W * 0.36;
  const bucketY = floorY + 10;
  if (isPencil) pencilStroke(); else solidStroke('#7A7A7A', 1.5);
  ctx.beginPath();
  ctx.moveTo(bucketX - 10, bucketY);
  ctx.lineTo(bucketX - 12, bucketY + 22);
  ctx.lineTo(bucketX + 12, bucketY + 22);
  ctx.lineTo(bucketX + 10, bucketY);
  ctx.closePath();
  if (colorAlpha > 0) { ctx.globalAlpha = colorAlpha; ctx.fillStyle = '#A8A8A8'; ctx.fill(); ctx.globalAlpha = 1; }
  ctx.stroke();
  // Handle
  ctx.beginPath();
  ctx.arc(bucketX, bucketY - 4, 9, Math.PI, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // Picture frame on wall (above door)
  // =====================
  const pfX = doorX + doorW / 2 - 14;
  const pfY = doorY - 28;
  if (isPencil) pencilStroke(); else solidStroke('#8B7355', 1.5);
  ctx.strokeRect(pfX, pfY, 28, 20);
  if (colorAlpha > 0) {
    ctx.globalAlpha = colorAlpha * 0.4;
    ctx.fillStyle = '#E8D5B7';
    ctx.fillRect(pfX + 2, pfY + 2, 24, 16);
    ctx.globalAlpha = 1;
  }
  ctx.setLineDash([]);

  // Reset state
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.restore();
}
