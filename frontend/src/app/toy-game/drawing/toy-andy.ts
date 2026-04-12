/**
 * Draws Baby Andy in Toy Story style with progressive coloring.
 *
 * colorProgress 0.0–1.0 controls how "colored in" Andy is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.2 = faint watercolor wash (low alpha fills)
 *   0.5 = top half colored, bottom still pencil
 *   0.8 = fully colored except star outline only
 *   1.0 = complete — star fills gold
 */
export function drawToyAndy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Gentle waddle
  const wobble = Math.sin(frame * 0.08) * 2.5;
  ctx.rotate(wobble * Math.PI / 180);

  // Body section thresholds — when each part starts getting color
  const HAT_THRESHOLD = 0.05;
  const HEAD_THRESHOLD = 0.1;
  const BODY_THRESHOLD = 0.3;
  const LEGS_THRESHOLD = 0.5;
  const BOOTS_THRESHOLD = 0.6;
  const STAR_THRESHOLD = 0.95;

  // Helper: get fill alpha for a body section based on its threshold
  const sectionAlpha = (threshold: number): number => {
    if (colorProgress <= threshold) return 0;
    return Math.min(1, (colorProgress - threshold) / 0.25);
  };

  // Helper: set pencil or colored stroke
  // Pencil mode uses dark graphite with sketchy varied dashes (like real pencil traces)
  const setPencilOrColor = (coloredStroke: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.1) {
      ctx.strokeStyle = '#3A3A3A';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 2, 2, 2]); // long-short pattern like hand-drawn pencil strokes
    } else {
      ctx.strokeStyle = coloredStroke;
      ctx.setLineDash([]);
    }
  };

  // Helper: fill with optional alpha based on coloring progress
  const fillWithProgress = (color: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.05) return; // pure pencil, no fill
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  // ---- BOOTS ----
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.lineWidth = 1.8;
  // Left boot
  ctx.beginPath();
  ctx.moveTo(-14, 32);
  ctx.lineTo(-14, 42);
  ctx.quadraticCurveTo(-14, 46, -18, 46);
  ctx.lineTo(-6, 46);
  ctx.quadraticCurveTo(-2, 46, -2, 42);
  ctx.lineTo(-2, 32);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right boot
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(2, 32);
  ctx.lineTo(2, 42);
  ctx.quadraticCurveTo(2, 46, -2, 46);
  // ctx shift for right boot
  ctx.moveTo(2, 32);
  ctx.lineTo(2, 42);
  ctx.quadraticCurveTo(2, 46, 6, 46);
  ctx.lineTo(18, 46);
  ctx.quadraticCurveTo(14, 46, 14, 42);
  ctx.lineTo(14, 32);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- LEGS (jeans) ----
  setPencilOrColor('#3B6EA5', LEGS_THRESHOLD);
  ctx.lineWidth = 1.8;
  // Left leg
  ctx.beginPath();
  ctx.rect(-14, 18, 12, 16);
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right leg
  setPencilOrColor('#3B6EA5', LEGS_THRESHOLD);
  ctx.beginPath();
  ctx.rect(2, 18, 12, 16);
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- BODY (yellow plaid shirt) ----
  setPencilOrColor('#B8860B', BODY_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Torso — rounded rectangle
  const bx = -18, by = -6, bw = 36, bh = 26;
  ctx.moveTo(bx + 6, by);
  ctx.lineTo(bx + bw - 6, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 6);
  ctx.lineTo(bx + bw, by + bh - 4);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 4, by + bh);
  ctx.lineTo(bx + 4, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 4);
  ctx.lineTo(bx, by + 6);
  ctx.quadraticCurveTo(bx, by, bx + 6, by);
  ctx.closePath();
  fillWithProgress('#FFD700', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Plaid lines on shirt (only when colored enough)
  if (sectionAlpha(BODY_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BODY_THRESHOLD) * 0.2;
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    // Vertical lines
    for (let lx = bx + 8; lx < bx + bw; lx += 9) {
      ctx.beginPath();
      ctx.moveTo(lx, by + 4);
      ctx.lineTo(lx, by + bh - 4);
      ctx.stroke();
    }
    // Horizontal lines
    for (let ly = by + 8; ly < by + bh; ly += 9) {
      ctx.beginPath();
      ctx.moveTo(bx + 4, ly);
      ctx.lineTo(bx + bw - 4, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- STAR on shirt ----
  const starAlpha = sectionAlpha(STAR_THRESHOLD);
  drawShirtStar(ctx, 0, 7, 8, colorProgress >= 1.0, starAlpha);

  // ---- ARMS (skin) ----
  setPencilOrColor('#E8C4A0', BODY_THRESHOLD);
  ctx.lineWidth = 1.5;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(-24, 8);
  ctx.lineTo(-22, 14);
  ctx.lineTo(-16, 12);
  ctx.closePath();
  fillWithProgress('#FDBCB4', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right arm
  setPencilOrColor('#E8C4A0', BODY_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(18, -2);
  ctx.lineTo(24, 8);
  ctx.lineTo(22, 14);
  ctx.lineTo(16, 12);
  ctx.closePath();
  fillWithProgress('#FDBCB4', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- HEAD ----
  setPencilOrColor('#E8C4A0', HEAD_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -20, 18, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Eyes
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(HEAD_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;
    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.ellipse(-7, -22, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -22, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#3D2B1F';
    ctx.beginPath(); ctx.arc(-6, -22, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -22, 2.5, 0, Math.PI * 2); ctx.fill();
    // Highlight dots
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(-5, -23, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -23, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    // Pencil eyes — dark graphite dots
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.arc(-6, -22, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -22, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // Cheeks
  if (sectionAlpha(HEAD_THRESHOLD) > 0.4) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD) * 0.4;
    ctx.fillStyle = '#FF9999';
    ctx.beginPath(); ctx.arc(-12, -16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Mouth
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#E88' : '#3A3A3A';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(0, -15, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // ---- COWBOY HAT ----
  setPencilOrColor('#6B3410', HAT_THRESHOLD);
  ctx.lineWidth = 2;

  // Hat brim
  ctx.beginPath();
  ctx.ellipse(0, -36, 28, 8, 0, 0, Math.PI * 2);
  fillWithProgress('#8B4513', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hat crown
  setPencilOrColor('#6B3410', HAT_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-16, -36);
  ctx.lineTo(-14, -54);
  ctx.quadraticCurveTo(0, -60, 14, -54);
  ctx.lineTo(16, -36);
  ctx.closePath();
  fillWithProgress('#8B4513', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hat band
  if (sectionAlpha(HAT_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAT_THRESHOLD);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-15, -42, 30, 5);
    ctx.restore();
  }

  ctx.setLineDash([]);
  ctx.restore();
}

/** Draws the sheriff star on the shirt. */
function drawShirtStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  filled: boolean, alpha: number,
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + (2 * Math.PI) / 10;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + r * Math.cos(outerAngle), y + r * Math.sin(outerAngle));
    ctx.lineTo(x + (r * 0.45) * Math.cos(innerAngle), y + (r * 0.45) * Math.sin(innerAngle));
  }
  ctx.closePath();

  if (filled) {
    // Full gold star with radial gradient
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#FFF8DC');
    grad.addColorStop(0.5, '#FFD700');
    grad.addColorStop(1, '#DAA520');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#8B6508';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (alpha > 0.05) {
    // Partially colored star outline
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Pencil star — dark graphite sketchy outline
    ctx.strokeStyle = '#3A3A3A';
    ctx.setLineDash([4, 2, 1, 2]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

/** Star burst particles when coloring completes. */
export function drawStarBurst(
  ctx: CanvasRenderingContext2D,
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
) {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05; // gravity
    p.life -= 0.025;
    if (p.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    // Tiny star shape
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](p.x + 3 * Math.cos(a), p.y + 3 * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

export function createStarBurstParticles(cx: number, cy: number, count = 12) {
  const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
  const colors = ['#FFD700', '#FFF8DC', '#DAA520', '#FFE4B5', '#FF6347'];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return particles;
}
