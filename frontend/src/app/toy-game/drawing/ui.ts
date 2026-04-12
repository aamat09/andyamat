export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawDialogueBox(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  speaker: string, lines: string[],
  showNext: boolean,
  highlight?: { line: number; color: string },
  registryBtn = false,
) {
  const lineH = lines.length > 5 ? 14 : 18;
  const boxH = 140;
  const boxY = H - boxH - 16;
  const boxX = 16;
  const boxW = W - 32;

  // Box bg — warm cream
  ctx.fillStyle = '#FFF8E7ee';
  roundRect(ctx, boxX, boxY, boxW, boxH, 12);
  ctx.fill();
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Speaker name
  ctx.fillStyle = '#8B4513';
  ctx.font = '700 13px "Fredoka One", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(speaker, boxX + 14, boxY + 22);

  // Text lines
  ctx.font = '600 13px "Nunito", sans-serif';
  lines.forEach((line, i) => {
    if (highlight && i === highlight.line) {
      const tw = ctx.measureText(line).width;
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(boxX + 12, boxY + 30 + i * lineH, tw + 8, lineH - 2);
      ctx.fillStyle = '#E74C3C';
    } else {
      ctx.fillStyle = '#3D2B1F';
    }
    ctx.fillText(line, boxX + 14, boxY + 44 + i * lineH);
  });

  // Registry button
  if (registryBtn) {
    const btnW = 160;
    const btnX = boxX + boxW - btnW - 12;
    const btnY = boxY + 8;
    ctx.fillStyle = '#FFD700';
    roundRect(ctx, btnX, btnY, btnW, 26, 13);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#8B4513';
    ctx.font = '700 11px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VIEW REGISTRY', btnX + btnW / 2, btnY + 18);
    ctx.textAlign = 'left';
  }

  // Next arrow
  if (showNext) {
    ctx.fillStyle = '#5B9BD5';
    ctx.font = '700 13px "Fredoka One", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('NEXT ▸', boxX + boxW - 12, boxY + boxH - 14);
  }
}

export function drawProgress(
  ctx: CanvasRenderingContext2D, W: number, step: number, total = 4,
) {
  const dotR = 6;
  const gap = 20;
  const startX = W / 2 - ((total - 1) * gap) / 2;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * gap, 20, dotR, 0, Math.PI * 2);
    if (i < step) {
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#8B4513';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawStar5(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
