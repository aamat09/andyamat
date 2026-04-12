/**
 * Draws Woody from Toy Story with progressive pencil-to-colored transition.
 *
 * colorProgress 0.0-1.0 controls how "colored in" Woody is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.5 = partial color (low alpha fills appearing)
 *   1.0 = fully colored
 *
 * Based on the classic standing pose with arms crossed, cowboy hat,
 * sheriff star, vest, and boots.
 */
export function drawWoody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Gentle wobble animation
  const wobble = Math.sin(frame * 0.08) * 2;
  ctx.rotate(wobble * Math.PI / 180);

  // Body section thresholds -- when each part starts getting color
  const HAT_THRESHOLD = 0.05;
  const HEAD_THRESHOLD = 0.1;
  const BODY_THRESHOLD = 0.25;
  const ARMS_THRESHOLD = 0.35;
  const LEGS_THRESHOLD = 0.5;
  const BOOTS_THRESHOLD = 0.6;
  const STAR_THRESHOLD = 0.9;

  // Helper: get fill alpha for a body section based on its threshold
  const sectionAlpha = (threshold: number): number => {
    if (colorProgress <= threshold) return 0;
    return Math.min(1, (colorProgress - threshold) / 0.3);
  };

  const setPencil = () => {
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 2, 2, 2]);
  };

  const setColored = (stroke: string) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
  };

  // Helper: set pencil or colored stroke
  const setPencilOrColor = (coloredStroke: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.1) {
      setPencil();
    } else {
      setColored(coloredStroke);
    }
  };

  // Helper: fill with optional alpha based on coloring progress
  const fillWithProgress = (color: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.05) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  // Woody is ~100px tall at scale=1, centered at origin.
  // Layout (approximate Y positions):
  //   Hat top: -50
  //   Head center: -30
  //   Neck: -18
  //   Torso: -18 to 10
  //   Arms crossed: -10 to 8
  //   Legs: 10 to 38
  //   Boots: 38 to 50

  // ---- BOOTS ----
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left boot
  ctx.beginPath();
  ctx.moveTo(-12, 38);
  ctx.lineTo(-14, 46);
  ctx.quadraticCurveTo(-14, 50, -18, 50);
  ctx.lineTo(-4, 50);
  ctx.quadraticCurveTo(-2, 50, -2, 46);
  ctx.lineTo(-4, 38);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();

  // Left spur
  if (sectionAlpha(BOOTS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BOOTS_THRESHOLD);
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-6, 47);
    ctx.lineTo(-3, 49);
    ctx.lineTo(-6, 50);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(-6, 47);
    ctx.lineTo(-3, 49);
    ctx.lineTo(-6, 50);
    ctx.stroke();
    ctx.restore();
  }

  // Right boot
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(4, 38);
  ctx.lineTo(2, 46);
  ctx.quadraticCurveTo(2, 50, 6, 50);
  ctx.lineTo(18, 50);
  ctx.quadraticCurveTo(16, 50, 14, 46);
  ctx.lineTo(12, 38);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();

  // Right spur
  if (sectionAlpha(BOOTS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BOOTS_THRESHOLD);
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(6, 47);
    ctx.lineTo(3, 49);
    ctx.lineTo(6, 50);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(6, 47);
    ctx.lineTo(3, 49);
    ctx.lineTo(6, 50);
    ctx.stroke();
    ctx.restore();
  }

  // ---- LEGS (blue jeans) ----
  setPencilOrColor('#3B6EA5', LEGS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-14, 10);
  ctx.lineTo(-14, 38);
  ctx.lineTo(-2, 38);
  ctx.lineTo(-2, 10);
  ctx.closePath();
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();

  // Right leg
  setPencilOrColor('#3B6EA5', LEGS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(2, 10);
  ctx.lineTo(2, 38);
  ctx.lineTo(14, 38);
  ctx.lineTo(14, 10);
  ctx.closePath();
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();

  // Belt
  setPencilOrColor('#5C2D0C', LEGS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-16, 8, 32, 4);
  fillWithProgress('#6B3410', LEGS_THRESHOLD);
  ctx.stroke();

  // Belt buckle (prominent gold oval)
  if (sectionAlpha(LEGS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(LEGS_THRESHOLD);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 10, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();
  }

  // ---- BODY (yellow plaid shirt + vest) ----

  // Shirt torso
  setPencilOrColor('#B8860B', BODY_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, -16);
  ctx.lineTo(-18, 10);
  ctx.lineTo(18, 10);
  ctx.lineTo(16, -16);
  ctx.quadraticCurveTo(0, -20, -16, -16);
  ctx.closePath();
  fillWithProgress('#F5D442', BODY_THRESHOLD);
  ctx.stroke();

  // Plaid lines on shirt (only when colored enough)
  if (sectionAlpha(BODY_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BODY_THRESHOLD) * 0.25;
    ctx.strokeStyle = '#C4A020';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);
    // Vertical lines
    for (let lx = -12; lx <= 12; lx += 8) {
      ctx.beginPath();
      ctx.moveTo(lx, -14);
      ctx.lineTo(lx, 8);
      ctx.stroke();
    }
    // Horizontal lines
    for (let ly = -10; ly <= 6; ly += 8) {
      ctx.beginPath();
      ctx.moveTo(-16, ly);
      ctx.lineTo(16, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Vest (cow-print pattern — white base with black spots)
  setPencilOrColor('#5C2D0C', BODY_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left vest panel
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.quadraticCurveTo(-18, -14, -20, -8);
  ctx.lineTo(-20, 8);
  ctx.lineTo(-14, 10);
  ctx.lineTo(-14, -6);
  ctx.quadraticCurveTo(-12, -12, -10, -16);
  ctx.closePath();
  fillWithProgress('#FFFDF5', BODY_THRESHOLD);
  ctx.stroke();

  // Cow-print spots on left vest panel
  if (sectionAlpha(BODY_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BODY_THRESHOLD);
    ctx.fillStyle = '#333';
    // Spot 1
    ctx.beginPath();
    ctx.moveTo(-18, -6);
    ctx.bezierCurveTo(-19, -9, -16, -11, -15, -8);
    ctx.bezierCurveTo(-14, -5, -17, -3, -18, -6);
    ctx.fill();
    // Spot 2
    ctx.beginPath();
    ctx.moveTo(-17, 2);
    ctx.bezierCurveTo(-18, 0, -15, -1, -15, 1);
    ctx.bezierCurveTo(-15, 3, -18, 4, -17, 2);
    ctx.fill();
    ctx.restore();
  }

  // Right vest panel
  setPencilOrColor('#5C2D0C', BODY_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(10, -16);
  ctx.quadraticCurveTo(18, -14, 20, -8);
  ctx.lineTo(20, 8);
  ctx.lineTo(14, 10);
  ctx.lineTo(14, -6);
  ctx.quadraticCurveTo(12, -12, 10, -16);
  ctx.closePath();
  fillWithProgress('#FFFDF5', BODY_THRESHOLD);
  ctx.stroke();

  // Cow-print spots on right vest panel
  if (sectionAlpha(BODY_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BODY_THRESHOLD);
    ctx.fillStyle = '#333';
    // Spot 1
    ctx.beginPath();
    ctx.moveTo(18, -7);
    ctx.bezierCurveTo(19, -10, 16, -12, 15, -9);
    ctx.bezierCurveTo(14, -6, 17, -4, 18, -7);
    ctx.fill();
    // Spot 2
    ctx.beginPath();
    ctx.moveTo(16, 1);
    ctx.bezierCurveTo(18, -1, 19, 2, 17, 3);
    ctx.bezierCurveTo(15, 4, 14, 2, 16, 1);
    ctx.fill();
    // Spot 3
    ctx.beginPath();
    ctx.moveTo(15, -2);
    ctx.bezierCurveTo(16, -4, 18, -3, 17, -1);
    ctx.bezierCurveTo(16, 0, 14, -1, 15, -2);
    ctx.fill();
    ctx.restore();
  }

  // ---- SHERIFF STAR on chest ----
  const starAlpha = sectionAlpha(STAR_THRESHOLD);
  drawSheriffStar(ctx, 0, -2, 7, colorProgress >= 1.0, starAlpha);

  // ---- ARMS CROSSED ----
  // Arms cross over the chest. Draw as overlapping curved shapes.
  setPencilOrColor('#B8860B', ARMS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left arm (shirt sleeve + skin hand on right side)
  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.quadraticCurveTo(-26, -6, -24, 0);
  ctx.quadraticCurveTo(-22, 6, -14, 4);
  ctx.lineTo(10, -2);
  ctx.quadraticCurveTo(14, -4, 12, -6);
  ctx.lineTo(-14, -8);
  ctx.closePath();
  fillWithProgress('#F5D442', ARMS_THRESHOLD);
  ctx.stroke();

  // Left hand (skin tone, peeking out on right)
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(12, -4, 5, 3.5, -0.2, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();

  // Right arm (shirt sleeve + skin hand on left side)
  setPencilOrColor('#B8860B', ARMS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(20, -12);
  ctx.quadraticCurveTo(26, -6, 24, 0);
  ctx.quadraticCurveTo(22, 6, 14, 4);
  ctx.lineTo(-10, 0);
  ctx.quadraticCurveTo(-14, -2, -12, -4);
  ctx.lineTo(14, -6);
  ctx.closePath();
  fillWithProgress('#F5D442', ARMS_THRESHOLD);
  ctx.stroke();

  // Right hand (skin tone, peeking out on left)
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-12, -2, 5, 3.5, 0.2, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();

  // ---- NECK ----
  setPencilOrColor('#E8C4A0', HEAD_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-4, -20, 8, 5);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();

  // Bandana / neckerchief
  setPencilOrColor('#D63031', BODY_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -16);
  ctx.lineTo(0, -10);
  ctx.lineTo(8, -16);
  ctx.quadraticCurveTo(4, -14, 0, -16);
  ctx.quadraticCurveTo(-4, -14, -8, -16);
  ctx.closePath();
  fillWithProgress('#E74C3C', BODY_THRESHOLD);
  ctx.stroke();

  // ---- HEAD ----
  setPencilOrColor('#E8C4A0', HEAD_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -30, 14, 16, 0, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();

  // Ears
  setPencilOrColor('#E8C4A0', HEAD_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-14, -28, 3, 4, 0, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(14, -28, 3, 4, 0, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();

  // Eyes
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(HEAD_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;
    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.ellipse(-6, -32, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -32, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Eye outlines
    ctx.strokeStyle = '#3D2B1F';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(-6, -32, 5, 4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(6, -32, 5, 4, 0, 0, Math.PI * 2); ctx.stroke();
    // Pupils
    ctx.fillStyle = '#3D2B1F';
    ctx.beginPath(); ctx.arc(-5, -32, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -32, 2.5, 0, Math.PI * 2); ctx.fill();
    // Highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(-4, -33, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -33, 1, 0, Math.PI * 2); ctx.fill();
    // Eyebrows
    ctx.strokeStyle = '#5C3A1E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -37);
    ctx.quadraticCurveTo(-6, -39, -2, -37);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -37);
    ctx.quadraticCurveTo(6, -39, 10, -37);
    ctx.stroke();
    ctx.restore();
  } else {
    // Pencil eyes
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.arc(-5, -32, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -32, 2.5, 0, Math.PI * 2); ctx.fill();
    // Pencil eyebrows
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(-10, -37);
    ctx.quadraticCurveTo(-6, -39, -2, -37);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -37);
    ctx.quadraticCurveTo(6, -39, 10, -37);
    ctx.stroke();
  }

  // Nose
  setPencilOrColor('#D4A080', HEAD_THRESHOLD);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(3, -26, 0, -24);
  ctx.stroke();

  // Mouth -- friendly smile
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#CC5555' : '#3A3A3A';
  ctx.lineWidth = 1.5;
  ctx.setLineDash(sectionAlpha(HEAD_THRESHOLD) > 0.3 ? [] : [4, 2]);
  ctx.beginPath();
  ctx.arc(0, -24, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Cheeks
  if (sectionAlpha(HEAD_THRESHOLD) > 0.4) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD) * 0.3;
    ctx.fillStyle = '#FF9999';
    ctx.beginPath(); ctx.arc(-10, -25, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -25, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---- COWBOY HAT ----

  // Hat brim (wide ellipse)
  setPencilOrColor('#A06A2E', HAT_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -44, 24, 6, 0, 0, Math.PI * 2);
  fillWithProgress('#C4883A', HAT_THRESHOLD);
  ctx.stroke();

  // Hat crown (tall rounded trapezoid)
  setPencilOrColor('#A06A2E', HAT_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-14, -44);
  ctx.bezierCurveTo(-14, -52, -12, -60, -8, -64);
  ctx.quadraticCurveTo(0, -68, 8, -64);
  ctx.bezierCurveTo(12, -60, 14, -52, 14, -44);
  ctx.closePath();
  fillWithProgress('#C4883A', HAT_THRESHOLD);
  ctx.stroke();

  // Hat band (gold)
  if (sectionAlpha(HAT_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAT_THRESHOLD);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.rect(-13, -50, 26, 4);
    ctx.fill();
    ctx.restore();
  } else {
    // Pencil hat band
    ctx.save();
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(-13, -48);
    ctx.lineTo(13, -48);
    ctx.moveTo(-13, -46);
    ctx.lineTo(13, -46);
    ctx.stroke();
    ctx.restore();
  }

  ctx.setLineDash([]);
  ctx.restore();
}

/** Draws the sheriff star badge. */
function drawSheriffStar(
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
    (ctx as any)[method](x + r * Math.cos(outerAngle), y + r * Math.sin(outerAngle));
    ctx.lineTo(x + (r * 0.45) * Math.cos(innerAngle), y + (r * 0.45) * Math.sin(innerAngle));
  }
  ctx.closePath();

  if (filled) {
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
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#3A3A3A';
    ctx.setLineDash([4, 2, 1, 2]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}
