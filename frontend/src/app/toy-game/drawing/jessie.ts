/**
 * Draws Jessie from Toy Story with progressive coloring.
 *
 * colorProgress 0.0–1.0 controls the pencil-to-colored transition:
 *   0.0 = pure pencil sketch (dark graphite dashed outlines, no fill)
 *   0.5 = partial color (low alpha fills appearing)
 *   1.0 = fully colored cartoon Jessie
 *
 * Jessie is drawn ~100px tall at scale=1.
 * Reference: upper body cowgirl, wide hat, red braid, friendly wave.
 */
export function drawJessie(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Subtle sway animation
  const sway = Math.sin(frame * 0.06) * 1.5;
  ctx.rotate(sway * Math.PI / 180);

  // Section thresholds — when each part starts getting color
  const HAT_THRESHOLD = 0.05;
  const HAIR_THRESHOLD = 0.1;
  const HEAD_THRESHOLD = 0.15;
  const BODY_THRESHOLD = 0.3;
  const ARMS_THRESHOLD = 0.35;
  const LEGS_THRESHOLD = 0.5;
  const BOOTS_THRESHOLD = 0.6;

  // Helper: get fill alpha for a body section based on its threshold
  const sectionAlpha = (threshold: number): number => {
    if (colorProgress <= threshold) return 0;
    return Math.min(1, (colorProgress - threshold) / 0.3);
  };

  // Helper: set pencil or colored stroke
  const setPencilOrColor = (coloredStroke: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.1) {
      ctx.strokeStyle = '#3A3A3A';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 2, 2, 2]);
    } else {
      ctx.strokeStyle = coloredStroke;
      ctx.setLineDash([]);
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

  // ---- BOOTS ----
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left boot
  ctx.beginPath();
  ctx.moveTo(-13, 36);
  ctx.lineTo(-13, 44);
  ctx.quadraticCurveTo(-13, 48, -17, 48);
  ctx.lineTo(-5, 48);
  ctx.quadraticCurveTo(-1, 48, -1, 44);
  ctx.lineTo(-1, 36);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right boot
  setPencilOrColor('#5C2D0C', BOOTS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(1, 36);
  ctx.lineTo(1, 44);
  ctx.quadraticCurveTo(1, 48, 5, 48);
  ctx.lineTo(17, 48);
  ctx.quadraticCurveTo(13, 48, 13, 44);
  ctx.lineTo(13, 36);
  ctx.closePath();
  fillWithProgress('#8B4513', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- LEGS (blue pants with white cow-print chaps) ----
  // Blue pants underneath
  setPencilOrColor('#3566A0', LEGS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left leg (blue pants)
  ctx.beginPath();
  ctx.rect(-13, 20, 12, 18);
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right leg (blue pants)
  setPencilOrColor('#3566A0', LEGS_THRESHOLD);
  ctx.beginPath();
  ctx.rect(1, 20, 12, 18);
  fillWithProgress('#4A86C8', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // White cow-print chaps over the pants
  setPencilOrColor('#999999', LEGS_THRESHOLD);
  ctx.lineWidth = 1.5;

  // Left chap
  ctx.beginPath();
  ctx.moveTo(-13, 20);
  ctx.lineTo(-15, 22);
  ctx.lineTo(-15, 36);
  ctx.lineTo(-13, 38);
  ctx.lineTo(-7, 38);
  ctx.lineTo(-7, 20);
  ctx.closePath();
  fillWithProgress('#FFFDF5', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right chap
  setPencilOrColor('#999999', LEGS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(7, 20);
  ctx.lineTo(7, 38);
  ctx.lineTo(13, 38);
  ctx.lineTo(15, 36);
  ctx.lineTo(15, 22);
  ctx.lineTo(13, 20);
  ctx.closePath();
  fillWithProgress('#FFFDF5', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cow-print spots on chaps
  if (sectionAlpha(LEGS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(LEGS_THRESHOLD);
    ctx.fillStyle = '#333333';
    ctx.setLineDash([]);

    // Left chap spots
    ctx.beginPath();
    ctx.ellipse(-11, 25, 2.5, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-10, 33, 2, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right chap spots
    ctx.beginPath();
    ctx.ellipse(11, 27, 2, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 34, 2.5, 1.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- BELT (blue with gold buckle) ----
  if (sectionAlpha(LEGS_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(LEGS_THRESHOLD);
    // Blue belt
    ctx.fillStyle = '#4A86C8';
    ctx.fillRect(-15, 19, 30, 4);
    ctx.strokeStyle = '#3566A0';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(-15, 19, 30, 4);
    // Gold buckle
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-3, 18.5, 6, 5);
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-3, 18.5, 6, 5);
    ctx.restore();
  }

  // ---- BODY (white cowgirl shirt with yellow trim) ----
  setPencilOrColor('#AAAAAA', BODY_THRESHOLD);
  ctx.lineWidth = 2;

  ctx.beginPath();
  const bx = -17, by = -4, bw = 34, bh = 26;
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
  fillWithProgress('#FFFDF5', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Yellow bib / yoke on chest
  if (sectionAlpha(BODY_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BODY_THRESHOLD);

    // Filled yoke area across the chest
    ctx.fillStyle = '#F5D442';
    ctx.beginPath();
    ctx.moveTo(-12, by);
    ctx.quadraticCurveTo(0, by + 10, 12, by);
    ctx.lineTo(12, by + 10);
    ctx.quadraticCurveTo(0, by + 16, -12, by + 10);
    ctx.closePath();
    ctx.fill();

    // Yoke outline
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Bottom trim
    ctx.strokeStyle = '#F5D442';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + bh);
    ctx.lineTo(bx + bw - 4, by + bh);
    ctx.stroke();

    // Sleeve trim lines
    ctx.strokeStyle = '#F5D442';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 8);
    ctx.lineTo(bx, by + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + bw, by + 8);
    ctx.lineTo(bx + bw, by + 14);
    ctx.stroke();

    ctx.restore();
  }

  // ---- LEFT ARM (down at side) ----
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-17, 0);
  ctx.lineTo(-23, 10);
  ctx.lineTo(-21, 16);
  ctx.lineTo(-15, 14);
  ctx.closePath();
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- RIGHT ARM (waving — raised up!) ----
  const waveAngle = Math.sin(frame * 0.12) * 8; // wave motion
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;

  ctx.save();
  ctx.translate(17, -2);
  ctx.rotate((-45 + waveAngle) * Math.PI / 180);

  // Upper arm
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(4, -18);
  ctx.lineTo(8, -18);
  ctx.lineTo(6, 0);
  ctx.closePath();
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hand (open, waving)
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.beginPath();
  ctx.arc(6, -22, 5, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Fingers
  setPencilOrColor('#E8C4A0', ARMS_THRESHOLD);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(3, -26);
  ctx.lineTo(2, -30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -26);
  ctx.lineTo(6, -31);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(9, -26);
  ctx.lineTo(10, -30);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore(); // end waving arm transform

  // ---- HEAD ----
  setPencilOrColor('#E8C4A0', HEAD_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -18, 16, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- EYES (big green eyes) ----
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(HEAD_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;

    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-6, -20, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, -20, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green irises
    ctx.fillStyle = '#2E8B57';
    ctx.beginPath();
    ctx.arc(-5, -20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(-5, -20, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -20, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlight dots
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-4, -21, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -21, 1, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    // Left eye lashes
    ctx.beginPath();
    ctx.moveTo(-10, -23);
    ctx.lineTo(-11, -25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, -24);
    ctx.lineTo(-7, -26);
    ctx.stroke();
    // Right eye lashes
    ctx.beginPath();
    ctx.moveTo(3, -24);
    ctx.lineTo(3, -26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -23);
    ctx.lineTo(11, -25);
    ctx.stroke();

    ctx.restore();
  } else {
    // Pencil eyes
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- FRECKLES ----
  if (sectionAlpha(HEAD_THRESHOLD) > 0.4) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD) * 0.5;
    ctx.fillStyle = '#C08050';
    const freckles = [
      [-9, -15], [-7, -14], [-5, -15],
      [5, -15], [7, -14], [9, -15],
    ];
    freckles.forEach(([fx, fy]) => {
      ctx.beginPath();
      ctx.arc(fx, fy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ---- CHEEKS ----
  if (sectionAlpha(HEAD_THRESHOLD) > 0.4) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD) * 0.35;
    ctx.fillStyle = '#FF9999';
    ctx.beginPath();
    ctx.arc(-11, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(11, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- MOUTH (friendly smile) ----
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#D05050' : '#3A3A3A';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(0, -12, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Teeth hint when colored
  if (sectionAlpha(HEAD_THRESHOLD) > 0.5) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD) * 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // ---- NOSE ----
  setPencilOrColor('#D4A08A', HEAD_THRESHOLD);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.quadraticCurveTo(3, -13, 0, -13);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- RED BRAIDED HAIR ----
  setPencilOrColor('#992200', HAIR_THRESHOLD);
  ctx.lineWidth = 2;

  // Hair on top of head (under hat)
  ctx.beginPath();
  ctx.moveTo(-14, -22);
  ctx.quadraticCurveTo(-16, -30, -12, -32);
  ctx.lineTo(12, -32);
  ctx.quadraticCurveTo(16, -30, 14, -22);
  ctx.closePath();
  fillWithProgress('#CC3300', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Side hair — left
  setPencilOrColor('#992200', HAIR_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-14, -22);
  ctx.quadraticCurveTo(-18, -16, -16, -8);
  ctx.quadraticCurveTo(-14, -4, -14, -2);
  fillWithProgress('#CC3300', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Side hair — right
  setPencilOrColor('#992200', HAIR_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(14, -22);
  ctx.quadraticCurveTo(18, -16, 16, -8);
  ctx.quadraticCurveTo(14, -4, 14, -2);
  fillWithProgress('#CC3300', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Main braid hanging down the back (visible to the right)
  setPencilOrColor('#992200', HAIR_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  // Braid weave pattern using bezier curves
  ctx.bezierCurveTo(14, 2, 8, 8, 14, 14);
  ctx.bezierCurveTo(8, 20, 14, 26, 10, 32);
  ctx.bezierCurveTo(14, 26, 8, 20, 14, 14);
  // Other side of braid
  ctx.moveTo(10, -6);
  ctx.bezierCurveTo(6, 2, 12, 8, 6, 14);
  ctx.bezierCurveTo(12, 20, 6, 26, 10, 32);
  fillWithProgress('#CC3300', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Braid cross-hatch detail
  if (sectionAlpha(HAIR_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAIR_THRESHOLD) * 0.4;
    ctx.strokeStyle = '#881100';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);
    for (let by2 = 0; by2 < 32; by2 += 6) {
      ctx.beginPath();
      ctx.moveTo(7, by2 - 4);
      ctx.lineTo(13, by2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(13, by2 - 4);
      ctx.lineTo(7, by2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Yellow bow / ribbon at the end of braid
  setPencilOrColor('#B8860B', HAIR_THRESHOLD);
  ctx.lineWidth = 1.5;
  // Bow left loop
  ctx.beginPath();
  ctx.moveTo(10, 32);
  ctx.quadraticCurveTo(4, 30, 4, 34);
  ctx.quadraticCurveTo(4, 38, 10, 36);
  ctx.closePath();
  fillWithProgress('#FFD700', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bow right loop
  setPencilOrColor('#B8860B', HAIR_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(10, 32);
  ctx.quadraticCurveTo(16, 30, 16, 34);
  ctx.quadraticCurveTo(16, 38, 10, 36);
  ctx.closePath();
  fillWithProgress('#FFD700', HAIR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bow center knot
  if (sectionAlpha(HAIR_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAIR_THRESHOLD);
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.arc(10, 34, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Ribbon tails
  setPencilOrColor('#B8860B', HAIR_THRESHOLD);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(8, 36);
  ctx.quadraticCurveTo(5, 42, 6, 44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, 36);
  ctx.quadraticCurveTo(15, 42, 14, 44);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- COWGIRL HAT ----
  setPencilOrColor('#A01E1E', HAT_THRESHOLD);
  ctx.lineWidth = 2;

  // Hat brim — wide and slightly curved
  ctx.beginPath();
  ctx.ellipse(0, -32, 28, 7, 0, 0, Math.PI * 2);
  fillWithProgress('#D42B2B', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hat crown — tall with dented top
  setPencilOrColor('#A01E1E', HAT_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-14, -32);
  ctx.lineTo(-12, -48);
  ctx.quadraticCurveTo(-6, -54, 0, -50);
  ctx.quadraticCurveTo(6, -54, 12, -48);
  ctx.lineTo(14, -32);
  ctx.closePath();
  fillWithProgress('#D42B2B', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // White hat trim along the brim
  if (sectionAlpha(HAT_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAT_THRESHOLD);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(0, -32, 28, 7, 0, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Hat band
  if (sectionAlpha(HAT_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAT_THRESHOLD);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-13, -38, 26, 4);
    ctx.restore();
  }

  ctx.setLineDash([]);
  ctx.restore();
}
