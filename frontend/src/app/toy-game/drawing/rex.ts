/**
 * Draws Rex the dinosaur from Toy Story with progressive coloring.
 *
 * colorProgress 0.0–1.0 controls how "colored in" Rex is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.3 = body color starts appearing
 *   0.5 = partial color (belly, arms getting color)
 *   0.8 = mostly colored, details appearing
 *   1.0 = fully colored Rex
 */
export function drawRex(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Gentle nervous wobble
  const wobble = Math.sin(frame * 0.1) * 1.8;
  ctx.rotate(wobble * Math.PI / 180);

  // Body section thresholds
  const TAIL_THRESHOLD = 0.05;
  const BODY_THRESHOLD = 0.15;
  const BELLY_THRESHOLD = 0.25;
  const LEGS_THRESHOLD = 0.35;
  const HEAD_THRESHOLD = 0.45;
  const ARMS_THRESHOLD = 0.55;
  const EYES_THRESHOLD = 0.65;
  const MOUTH_THRESHOLD = 0.75;
  const SPOTS_THRESHOLD = 0.85;

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
      ctx.lineWidth = 2;
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

  // Arm wave animation
  const armWave = Math.sin(frame * 0.12) * 0.15;

  // ---- TAIL ----
  setPencilOrColor('#3D7A35', TAIL_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(18, 10);
  ctx.bezierCurveTo(28, 8, 38, 0, 42, -8);
  ctx.bezierCurveTo(44, -14, 40, -18, 36, -14);
  ctx.bezierCurveTo(32, -8, 26, 2, 18, 14);
  ctx.closePath();
  fillWithProgress('#4A8B3F', TAIL_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- LEGS / FEET ----
  // Left leg
  setPencilOrColor('#3D7A35', LEGS_THRESHOLD);
  ctx.lineWidth = sectionAlpha(LEGS_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  ctx.moveTo(-12, 28);
  ctx.lineTo(-14, 40);
  ctx.quadraticCurveTo(-16, 46, -20, 46);
  ctx.lineTo(-4, 46);
  ctx.quadraticCurveTo(-2, 46, -2, 42);
  ctx.lineTo(-2, 28);
  ctx.closePath();
  fillWithProgress('#4A8B3F', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left toes
  setPencilOrColor('#3D7A35', LEGS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-18, 46);
  ctx.lineTo(-20, 49);
  ctx.moveTo(-14, 46);
  ctx.lineTo(-15, 49);
  ctx.moveTo(-10, 46);
  ctx.lineTo(-10, 49);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right leg
  setPencilOrColor('#3D7A35', LEGS_THRESHOLD);
  ctx.lineWidth = sectionAlpha(LEGS_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  ctx.moveTo(2, 28);
  ctx.lineTo(2, 40);
  ctx.quadraticCurveTo(2, 46, 4, 46);
  ctx.lineTo(20, 46);
  ctx.quadraticCurveTo(16, 46, 14, 42);
  ctx.lineTo(12, 28);
  ctx.closePath();
  fillWithProgress('#4A8B3F', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right toes
  setPencilOrColor('#3D7A35', LEGS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(8, 46);
  ctx.lineTo(7, 49);
  ctx.moveTo(12, 46);
  ctx.lineTo(12, 49);
  ctx.moveTo(16, 46);
  ctx.lineTo(17, 49);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- BODY (big round belly) ----
  setPencilOrColor('#3D7A35', BODY_THRESHOLD);
  ctx.lineWidth = sectionAlpha(BODY_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  ctx.ellipse(0, 14, 22, 20, 0, 0, Math.PI * 2);
  fillWithProgress('#4A8B3F', BODY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- BELLY (lighter patch) ----
  setPencilOrColor('#4A8B3F', BELLY_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 18, 14, 14, 0, 0, Math.PI * 2);
  fillWithProgress('#6BBF59', BELLY_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- SPOTS on back (optional detail) ----
  if (sectionAlpha(SPOTS_THRESHOLD) > 0.1) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(SPOTS_THRESHOLD) * 0.5;
    ctx.fillStyle = '#3D7A35';
    ctx.beginPath(); ctx.ellipse(14, 4, 3, 2, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, 12, 2.5, 1.8, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -2, 2, 1.5, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (sectionAlpha(SPOTS_THRESHOLD) <= 0.1) {
    // Pencil spots
    ctx.save();
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.ellipse(14, 4, 3, 2, 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(18, 12, 2.5, 1.8, -0.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(12, -2, 2, 1.5, 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ---- TINY ARMS ----
  ctx.save();
  // Left arm (waving!)
  setPencilOrColor('#3D7A35', ARMS_THRESHOLD);
  ctx.lineWidth = sectionAlpha(ARMS_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  ctx.save();
  ctx.translate(-18, 2);
  ctx.rotate(-0.6 + armWave);
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, -6);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-6, -2);
  ctx.lineTo(-4, 2);
  ctx.closePath();
  fillWithProgress('#4A8B3F', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);
  // Tiny fingers
  ctx.beginPath();
  ctx.moveTo(-9, -5);
  ctx.lineTo(-12, -7);
  ctx.moveTo(-10, -4);
  ctx.lineTo(-13, -5);
  ctx.stroke();
  ctx.restore();

  // Right arm
  setPencilOrColor('#3D7A35', ARMS_THRESHOLD);
  ctx.lineWidth = sectionAlpha(ARMS_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  ctx.save();
  ctx.translate(18, 2);
  ctx.rotate(0.3 - armWave * 0.5);
  ctx.moveTo(0, 0);
  ctx.lineTo(6, -4);
  ctx.lineTo(8, -2);
  ctx.lineTo(4, 0);
  ctx.lineTo(2, 3);
  ctx.closePath();
  fillWithProgress('#4A8B3F', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);
  // Tiny fingers
  ctx.beginPath();
  ctx.moveTo(7, -3);
  ctx.lineTo(10, -5);
  ctx.moveTo(8, -2);
  ctx.lineTo(11, -2);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // arms save

  // ---- HEAD ----
  setPencilOrColor('#3D7A35', HEAD_THRESHOLD);
  ctx.lineWidth = sectionAlpha(HEAD_THRESHOLD) < 0.1 ? 2.2 : 2;
  ctx.beginPath();
  // Slightly elongated head (dinosaur snout shape)
  ctx.ellipse(0, -16, 16, 14, 0, 0, Math.PI * 2);
  fillWithProgress('#4A8B3F', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Snout bump (muzzle area — slightly protruding)
  setPencilOrColor('#3D7A35', HEAD_THRESHOLD);
  ctx.lineWidth = sectionAlpha(HEAD_THRESHOLD) < 0.1 ? 2.2 : 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -10, 12, 8, 0, -0.2, Math.PI + 0.2);
  fillWithProgress('#4A8B3F', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Lighter muzzle/chin
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD);
    ctx.fillStyle = '#6BBF59';
    ctx.beginPath();
    ctx.ellipse(0, -8, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- MOUTH (big open grin) ----
  setPencilOrColor('#3D7A35', MOUTH_THRESHOLD);
  ctx.lineWidth = sectionAlpha(MOUTH_THRESHOLD) < 0.1 ? 2.2 : 2;
  // Open mouth shape
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.quadraticCurveTo(-6, -3, 0, -2);
  ctx.quadraticCurveTo(6, -3, 8, -8);
  if (sectionAlpha(MOUTH_THRESHOLD) > 0.1) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(MOUTH_THRESHOLD);
    ctx.fillStyle = '#D94F5C';
    ctx.fill();
    ctx.restore();
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Teeth along the top of the mouth
  ctx.save();
  const teethColor = sectionAlpha(MOUTH_THRESHOLD) > 0.1 ? '#FFFFFF' : '#3A3A3A';
  ctx.fillStyle = teethColor;
  ctx.strokeStyle = sectionAlpha(MOUTH_THRESHOLD) > 0.1 ? '#DDDDDD' : '#3A3A3A';
  ctx.lineWidth = 0.8;
  if (sectionAlpha(MOUTH_THRESHOLD) > 0.1) {
    ctx.globalAlpha = sectionAlpha(MOUTH_THRESHOLD);
  }
  // Small triangular teeth
  const teethPositions = [-6, -3, 0, 3, 6];
  teethPositions.forEach(tx => {
    ctx.beginPath();
    ctx.moveTo(tx - 1.5, -8);
    ctx.lineTo(tx, -5.5);
    ctx.lineTo(tx + 1.5, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();

  // ---- NOSTRILS ----
  ctx.save();
  ctx.fillStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#3D7A35' : '#3A3A3A';
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    ctx.globalAlpha = sectionAlpha(HEAD_THRESHOLD);
  }
  ctx.beginPath(); ctx.arc(-3, -12, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -12, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ---- EYES (big, worried/nervous) ----
  if (sectionAlpha(EYES_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(EYES_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;
    // Eye whites (big!)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-7, -20, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -20, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
    // Eye outlines
    ctx.strokeStyle = '#3D7A35';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(-7, -20, 6, 7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(7, -20, 6, 7, 0, 0, Math.PI * 2); ctx.stroke();
    // Pupils (looking slightly up — nervous!)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(-6, -21, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -21, 3, 0, Math.PI * 2); ctx.fill();
    // Highlight dots
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-5, -22.5, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -22.5, 1.2, 0, Math.PI * 2); ctx.fill();
    // Worried eyebrows (slightly raised/angled)
    ctx.strokeStyle = '#2D5E25';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-12, -27);
    ctx.quadraticCurveTo(-7, -29, -2, -27);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -27);
    ctx.quadraticCurveTo(7, -29, 12, -27);
    ctx.stroke();
    ctx.restore();
  } else {
    // Pencil eyes — dark graphite
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.ellipse(-7, -20, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -20, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Pencil eye highlights (tiny white dots to show life)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-5, -22, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -22, 1.5, 0, Math.PI * 2); ctx.fill();
    // Pencil eyebrows
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(-12, -27);
    ctx.quadraticCurveTo(-7, -29, -2, -27);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -27);
    ctx.quadraticCurveTo(7, -29, 12, -27);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---- HEAD RIDGE / BUMPS (top of head) ----
  setPencilOrColor('#3D7A35', HEAD_THRESHOLD);
  ctx.lineWidth = sectionAlpha(HEAD_THRESHOLD) < 0.1 ? 2.2 : 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -29);
  ctx.quadraticCurveTo(-4, -33, -2, -29);
  ctx.quadraticCurveTo(0, -34, 2, -29);
  ctx.quadraticCurveTo(4, -33, 6, -29);
  fillWithProgress('#4A8B3F', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.setLineDash([]);
  ctx.restore();
}
