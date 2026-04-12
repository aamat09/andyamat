/**
 * Draws Mr. Potato Head (Toy Story) with progressive coloring.
 *
 * colorProgress 0.0–1.0 controls how "colored in" he is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.5 = partial color (low alpha fills appearing)
 *   1.0 = fully colored
 */
export function drawPotatoHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Gentle sway animation
  const wobble = Math.sin(frame * 0.06) * 1.5;
  ctx.rotate(wobble * Math.PI / 180);

  // Body section thresholds — when each part starts getting color
  const BODY_THRESHOLD = 0.05;
  const FACE_THRESHOLD = 0.15;
  const HAT_THRESHOLD = 0.3;
  const ARMS_THRESHOLD = 0.4;
  const FEET_THRESHOLD = 0.55;
  const DETAILS_THRESHOLD = 0.7;

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

  // ---- FEET / SHOES ----
  setPencilOrColor('#2A2A8A', FEET_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left shoe
  ctx.beginPath();
  ctx.moveTo(-14, 38);
  ctx.lineTo(-14, 43);
  ctx.quadraticCurveTo(-14, 47, -20, 47);
  ctx.lineTo(-4, 47);
  ctx.quadraticCurveTo(-2, 47, -2, 43);
  ctx.lineTo(-2, 38);
  ctx.closePath();
  fillWithProgress('#3366CC', FEET_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right shoe
  setPencilOrColor('#2A2A8A', FEET_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(2, 38);
  ctx.lineTo(2, 43);
  ctx.quadraticCurveTo(2, 47, -2, 47);
  ctx.moveTo(2, 38);
  ctx.lineTo(2, 43);
  ctx.quadraticCurveTo(2, 47, 8, 47);
  ctx.lineTo(20, 47);
  ctx.quadraticCurveTo(14, 47, 14, 43);
  ctx.lineTo(14, 38);
  ctx.closePath();
  fillWithProgress('#3366CC', FEET_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Thin legs connecting body to shoes
  setPencilOrColor('#3A3A3A', FEET_THRESHOLD);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-8, 28);
  ctx.lineTo(-8, 38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 28);
  ctx.lineTo(8, 38);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- LEFT ARM (at side) ----
  setPencilOrColor('#7A9BB5', ARMS_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-26, -6);
  ctx.quadraticCurveTo(-34, 4, -30, 16);
  ctx.quadraticCurveTo(-28, 20, -24, 18);
  ctx.quadraticCurveTo(-22, 10, -24, -2);
  ctx.closePath();
  fillWithProgress('#9BB7D4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left hand (small fist)
  setPencilOrColor('#7A9BB5', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-27, 19, 5, 4, 0.2, 0, Math.PI * 2);
  fillWithProgress('#9BB7D4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- RIGHT ARM (waving!) ----
  const waveAngle = Math.sin(frame * 0.12) * 0.15; // subtle wave animation
  ctx.save();
  ctx.translate(26, -10);
  ctx.rotate(-0.8 + waveAngle);

  setPencilOrColor('#7A9BB5', ARMS_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -14, 4, -28);
  ctx.quadraticCurveTo(2, -30, -2, -28);
  ctx.quadraticCurveTo(-4, -14, -4, 0);
  ctx.closePath();
  fillWithProgress('#9BB7D4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Waving hand — open palm with fingers
  setPencilOrColor('#7A9BB5', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(1, -32, 6, 5, -0.2, 0, Math.PI * 2);
  fillWithProgress('#9BB7D4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Fingers
  setPencilOrColor('#7A9BB5', ARMS_THRESHOLD);
  ctx.lineWidth = 1.2;
  const fingerAngles = [-0.6, -0.2, 0.2, 0.6];
  for (const fa of fingerAngles) {
    ctx.beginPath();
    ctx.moveTo(1 + Math.cos(fa) * 5, -32 + Math.sin(fa) * 4 - 3);
    ctx.lineTo(1 + Math.cos(fa) * 10, -32 + Math.sin(fa) * 8 - 6);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // ---- POTATO BODY ----
  setPencilOrColor('#B8956A', BODY_THRESHOLD);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  // Egg/potato shape — wider at bottom, narrower at top
  ctx.moveTo(0, -28);
  ctx.bezierCurveTo(22, -28, 30, -8, 28, 8);
  ctx.bezierCurveTo(26, 22, 16, 30, 0, 30);
  ctx.bezierCurveTo(-16, 30, -26, 22, -28, 8);
  ctx.bezierCurveTo(-30, -8, -22, -28, 0, -28);
  ctx.closePath();
  fillWithProgress('#DEB887', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- EARS ----
  // Left ear
  setPencilOrColor('#B87070', FACE_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-28, -6, 7, 10, -0.2, 0, Math.PI * 2);
  fillWithProgress('#E8A0A0', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);
  // Inner ear detail
  setPencilOrColor('#D4908F', DETAILS_THRESHOLD);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-29, -5, 3, 6, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right ear
  setPencilOrColor('#B87070', FACE_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(28, -6, 7, 10, 0.2, 0, Math.PI * 2);
  fillWithProgress('#E8A0A0', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);
  // Inner ear detail
  setPencilOrColor('#D4908F', DETAILS_THRESHOLD);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(29, -5, 3, 6, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- EYES ----
  if (sectionAlpha(FACE_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(FACE_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;

    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-10, -12, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(10, -12, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Pupils — look slightly to side
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(-8, -11, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -11, 3.5, 0, Math.PI * 2); ctx.fill();

    // Highlight dots
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(-6, -13, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, -13, 1.2, 0, Math.PI * 2); ctx.fill();

    // Eyebrows — left normal, right raised
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Left eyebrow (normal)
    ctx.beginPath();
    ctx.moveTo(-17, -21);
    ctx.quadraticCurveTo(-10, -24, -3, -21);
    ctx.stroke();
    // Right eyebrow (raised higher)
    ctx.beginPath();
    ctx.moveTo(3, -22);
    ctx.quadraticCurveTo(10, -27, 17, -22);
    ctx.stroke();

    ctx.restore();
  } else {
    // Pencil eyes — dark graphite ovals
    ctx.fillStyle = '#3A3A3A';
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 2, 2, 2]);
    ctx.beginPath(); ctx.ellipse(-10, -12, 8, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(10, -12, 8, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // Pencil pupils
    ctx.beginPath(); ctx.arc(-8, -11, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -11, 3, 0, Math.PI * 2); ctx.fill();
    // Pencil eyebrows
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 2, 2, 2]);
    ctx.beginPath();
    ctx.moveTo(-17, -21);
    ctx.quadraticCurveTo(-10, -24, -3, -21);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, -22);
    ctx.quadraticCurveTo(10, -27, 17, -22);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---- NOSE ----
  setPencilOrColor('#C96A1A', FACE_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.bezierCurveTo(-8, -4, -10, 4, -4, 6);
  ctx.quadraticCurveTo(0, 8, 4, 6);
  ctx.bezierCurveTo(10, 4, 8, -4, 0, -6);
  ctx.closePath();
  fillWithProgress('#E67E22', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- MUSTACHE ----
  setPencilOrColor('#2C2C2C', FACE_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Big bushy mustache — two swooping sides
  ctx.moveTo(-20, 8);
  ctx.quadraticCurveTo(-14, 4, -8, 7);
  ctx.quadraticCurveTo(-3, 10, 0, 7);
  ctx.quadraticCurveTo(3, 10, 8, 7);
  ctx.quadraticCurveTo(14, 4, 20, 8);
  ctx.quadraticCurveTo(16, 14, 8, 12);
  ctx.quadraticCurveTo(4, 14, 0, 12);
  ctx.quadraticCurveTo(-4, 14, -8, 12);
  ctx.quadraticCurveTo(-16, 14, -20, 8);
  ctx.closePath();
  fillWithProgress('#333', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- MOUTH / GRIN ----
  setPencilOrColor('#C0392B', DETAILS_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, 14);
  ctx.quadraticCurveTo(-6, 22, 0, 20);
  ctx.quadraticCurveTo(6, 22, 12, 14);
  ctx.stroke();
  ctx.setLineDash([]);

  // Teeth (when colored)
  if (sectionAlpha(DETAILS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(DETAILS_THRESHOLD);
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(-6, 15);
    ctx.quadraticCurveTo(-3, 19, 0, 18);
    ctx.quadraticCurveTo(3, 19, 6, 15);
    ctx.quadraticCurveTo(3, 16, 0, 16);
    ctx.quadraticCurveTo(-3, 16, -6, 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---- BOWLER HAT ----
  setPencilOrColor('#222', HAT_THRESHOLD);
  ctx.lineWidth = 2;

  // Hat brim
  ctx.beginPath();
  ctx.ellipse(0, -27, 22, 5, 0, 0, Math.PI * 2);
  fillWithProgress('#333', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hat dome (rounded top)
  setPencilOrColor('#222', HAT_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-14, -28);
  ctx.quadraticCurveTo(-14, -44, 0, -44);
  ctx.quadraticCurveTo(14, -44, 14, -28);
  ctx.closePath();
  fillWithProgress('#333', HAT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hat band
  if (sectionAlpha(HAT_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HAT_THRESHOLD);
    ctx.fillStyle = '#555';
    ctx.fillRect(-14, -31, 28, 3);
    ctx.restore();
  }

  ctx.setLineDash([]);
  ctx.restore();
}
