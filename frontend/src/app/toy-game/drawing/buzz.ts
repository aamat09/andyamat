/**
 * Draws Buzz Lightyear in Toy Story style with progressive coloring.
 *
 * colorProgress 0.0-1.0 controls how "colored in" Buzz is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.2 = faint color wash on helmet
 *   0.5 = upper body colored, lower still pencil
 *   0.8 = mostly colored
 *   1.0 = fully colored with all details
 */
export function drawBuzz(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Subtle breathing / heroic sway
  const sway = Math.sin(frame * 0.06) * 1.5;
  ctx.rotate(sway * Math.PI / 180);

  // Body section thresholds
  const WINGS_THRESHOLD = 0.05;
  const HELMET_THRESHOLD = 0.1;
  const HEAD_THRESHOLD = 0.15;
  const TORSO_THRESHOLD = 0.3;
  const BELT_THRESHOLD = 0.45;
  const ARMS_THRESHOLD = 0.35;
  const LEGS_THRESHOLD = 0.55;
  const BOOTS_THRESHOLD = 0.65;

  const sectionAlpha = (threshold: number): number => {
    if (colorProgress <= threshold) return 0;
    return Math.min(1, (colorProgress - threshold) / 0.3);
  };

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

  const fillWithProgress = (color: string, threshold: number) => {
    const alpha = sectionAlpha(threshold);
    if (alpha < 0.05) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  // ---- WINGS (behind body) ----
  // Slight flap animation
  const wingFlap = Math.sin(frame * 0.1) * 3;

  // Left wing
  setPencilOrColor('#3D9B3D', WINGS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-16, -20);
  ctx.quadraticCurveTo(-50, -35 + wingFlap, -55, -10 + wingFlap);
  ctx.quadraticCurveTo(-50, 0 + wingFlap, -18, -5);
  ctx.closePath();
  fillWithProgress('#4CAF50', WINGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left wing accent stripe
  if (sectionAlpha(WINGS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(WINGS_THRESHOLD) * 0.6;
    ctx.strokeStyle = '#7B2D8E';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-20, -17);
    ctx.quadraticCurveTo(-42, -28 + wingFlap, -48, -12 + wingFlap);
    ctx.stroke();
    ctx.restore();
  }

  // Right wing
  setPencilOrColor('#3D9B3D', WINGS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(16, -20);
  ctx.quadraticCurveTo(50, -35 + wingFlap, 55, -10 + wingFlap);
  ctx.quadraticCurveTo(50, 0 + wingFlap, 18, -5);
  ctx.closePath();
  fillWithProgress('#4CAF50', WINGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right wing accent stripe
  if (sectionAlpha(WINGS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(WINGS_THRESHOLD) * 0.6;
    ctx.strokeStyle = '#7B2D8E';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(20, -17);
    ctx.quadraticCurveTo(42, -28 + wingFlap, 48, -12 + wingFlap);
    ctx.stroke();
    ctx.restore();
  }

  // ---- BOOTS ----
  setPencilOrColor('#3D9B3D', BOOTS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left boot
  ctx.beginPath();
  ctx.moveTo(-14, 32);
  ctx.lineTo(-14, 42);
  ctx.quadraticCurveTo(-14, 47, -19, 47);
  ctx.lineTo(-4, 47);
  ctx.quadraticCurveTo(-1, 47, -1, 42);
  ctx.lineTo(-1, 32);
  ctx.closePath();
  fillWithProgress('#F0F0F0', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left boot green accent
  if (sectionAlpha(BOOTS_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BOOTS_THRESHOLD);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(-14, 38, 13, 4);
    ctx.restore();
  }

  // Right boot
  setPencilOrColor('#3D9B3D', BOOTS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(1, 32);
  ctx.lineTo(1, 42);
  ctx.quadraticCurveTo(1, 47, 4, 47);
  ctx.lineTo(19, 47);
  ctx.quadraticCurveTo(14, 47, 14, 42);
  ctx.lineTo(14, 32);
  ctx.closePath();
  fillWithProgress('#F0F0F0', BOOTS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right boot green accent
  if (sectionAlpha(BOOTS_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BOOTS_THRESHOLD);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(1, 38, 13, 4);
    ctx.restore();
  }

  // ---- LEGS (white suit) ----
  setPencilOrColor('#AAAAAA', LEGS_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Left leg
  ctx.beginPath();
  ctx.rect(-14, 18, 13, 16);
  fillWithProgress('#F0F0F0', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right leg
  setPencilOrColor('#AAAAAA', LEGS_THRESHOLD);
  ctx.beginPath();
  ctx.rect(1, 18, 13, 16);
  fillWithProgress('#F0F0F0', LEGS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Purple stripes on legs
  if (sectionAlpha(LEGS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(LEGS_THRESHOLD) * 0.7;
    ctx.fillStyle = '#7B2D8E';
    ctx.fillRect(-14, 22, 13, 3);
    ctx.fillRect(1, 22, 13, 3);
    ctx.restore();
  }

  // ---- BELT ----
  setPencilOrColor('#2E7D6F', BELT_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-18, 14, 36, 6);
  fillWithProgress('#2E7D6F', BELT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Belt buttons
  if (sectionAlpha(BELT_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(BELT_THRESHOLD);
    // Red button
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(-6, 17, 2, 0, Math.PI * 2);
    ctx.fill();
    // Blue button
    ctx.fillStyle = '#4488FF';
    ctx.beginPath();
    ctx.arc(0, 17, 2, 0, Math.PI * 2);
    ctx.fill();
    // Green button
    ctx.fillStyle = '#44FF44';
    ctx.beginPath();
    ctx.arc(6, 17, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- TORSO (white space suit) ----
  setPencilOrColor('#AAAAAA', TORSO_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  const tx = -18, ty = -10, tw = 36, th = 26;
  ctx.moveTo(tx + 6, ty);
  ctx.lineTo(tx + tw - 6, ty);
  ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + 6);
  ctx.lineTo(tx + tw, ty + th - 4);
  ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - 4, ty + th);
  ctx.lineTo(tx + 4, ty + th);
  ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - 4);
  ctx.lineTo(tx, ty + 6);
  ctx.quadraticCurveTo(tx, ty, tx + 6, ty);
  ctx.closePath();
  fillWithProgress('#F0F0F0', TORSO_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Chest and shoulder accents
  if (sectionAlpha(TORSO_THRESHOLD) > 0.2) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(TORSO_THRESHOLD) * 0.8;
    // Purple shoulder caps
    ctx.fillStyle = '#7B2D8E';
    // Left shoulder
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.lineTo(-18, 2);
    ctx.lineTo(-10, 2);
    ctx.lineTo(-10, -4);
    ctx.closePath();
    ctx.fill();
    // Right shoulder
    ctx.beginPath();
    ctx.moveTo(18, -4);
    ctx.lineTo(18, 2);
    ctx.lineTo(10, 2);
    ctx.lineTo(10, -4);
    ctx.closePath();
    ctx.fill();

    // Green chest panel / stripe
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(-8, -4, 16, 14);
    ctx.restore();
  }

  // Star Command badge on chest
  if (sectionAlpha(TORSO_THRESHOLD) > 0.5) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(TORSO_THRESHOLD);
    ctx.fillStyle = '#7B2D8E';
    ctx.beginPath();
    ctx.arc(0, 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- LEFT ARM (pointing forward — extended) ----
  setPencilOrColor('#AAAAAA', ARMS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-18, -6);
  ctx.lineTo(-26, 0);
  ctx.lineTo(-32, -8);
  ctx.lineTo(-34, -10);
  // Fist shape
  ctx.quadraticCurveTo(-38, -12, -36, -14);
  ctx.lineTo(-30, -12);
  ctx.lineTo(-24, -6);
  ctx.lineTo(-18, -10);
  ctx.closePath();
  fillWithProgress('#F0F0F0', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pointing finger on left hand
  setPencilOrColor('#D4A490', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-36, -13);
  ctx.lineTo(-42, -16);
  ctx.lineTo(-41, -18);
  ctx.lineTo(-35, -15);
  ctx.closePath();
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Green upper arm accent
  if (sectionAlpha(ARMS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(ARMS_THRESHOLD) * 0.7;
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(-24, -1);
    ctx.lineTo(-22, 1);
    ctx.lineTo(-18, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Right arm (at side)
  setPencilOrColor('#AAAAAA', ARMS_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(18, -6);
  ctx.lineTo(24, 4);
  ctx.lineTo(22, 12);
  ctx.lineTo(16, 10);
  ctx.closePath();
  fillWithProgress('#F0F0F0', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right hand
  setPencilOrColor('#D4A490', ARMS_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(21, 13, 3.5, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', ARMS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Green accent on right upper arm
  if (sectionAlpha(ARMS_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(ARMS_THRESHOLD) * 0.7;
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(20, -3);
    ctx.lineTo(24, 1);
    ctx.lineTo(22, 3);
    ctx.lineTo(18, -1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---- HELMET (dome) ----
  setPencilOrColor('#6A0DAD', HELMET_THRESHOLD);
  ctx.lineWidth = 2;

  // Helmet base — purple collar
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 10, 0, 0, Math.PI, true);
  ctx.lineTo(-22, -18);
  ctx.quadraticCurveTo(-22, -12, -18, -10);
  ctx.lineTo(18, -10);
  ctx.quadraticCurveTo(22, -12, 22, -18);
  ctx.closePath();
  fillWithProgress('#7B2D8E', HELMET_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Helmet dome — clear visor
  setPencilOrColor('#9B7FBF', HELMET_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -30, 20, 0, Math.PI * 2);
  fillWithProgress('rgba(210, 230, 255, 0.2)', HELMET_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Helmet glare
  if (sectionAlpha(HELMET_THRESHOLD) > 0.4) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(HELMET_THRESHOLD) * 0.3;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-6, -38, 6, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- HEAD (inside helmet) ----
  setPencilOrColor('#D4A490', HEAD_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -28, 14, 0, Math.PI * 2);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Big determined chin
  setPencilOrColor('#D4A490', HEAD_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -18);
  ctx.quadraticCurveTo(-8, -12, 0, -11);
  ctx.quadraticCurveTo(8, -12, 8, -18);
  fillWithProgress('#FDBCB4', HEAD_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Chin cleft
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#D4A490' : '#3A3A3A';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, -12);
  ctx.stroke();

  // Eyes
  if (sectionAlpha(HEAD_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(HEAD_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;
    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.ellipse(-5, -31, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -31, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // Pupils — determined look
    ctx.fillStyle = '#2D5A1E';
    ctx.beginPath(); ctx.arc(-4, -31, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -31, 2.2, 0, Math.PI * 2); ctx.fill();
    // Highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(-3, -32, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -32, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    // Pencil eyes
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.arc(-5, -31, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -31, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  // Eyebrows — determined / furrowed
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#3D2B1F' : '#3A3A3A';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(-9, -36);
  ctx.lineTo(-2, -35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -35);
  ctx.lineTo(9, -36);
  ctx.stroke();

  // Mouth — determined grin
  ctx.strokeStyle = sectionAlpha(HEAD_THRESHOLD) > 0.3 ? '#C06060' : '#3A3A3A';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(-4, -22);
  ctx.quadraticCurveTo(0, -19, 4, -22);
  ctx.stroke();

  // Purple hood/cap on top of head
  setPencilOrColor('#6A0DAD', HELMET_THRESHOLD);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, -34);
  ctx.quadraticCurveTo(-12, -42, 0, -43);
  ctx.quadraticCurveTo(12, -42, 12, -34);
  fillWithProgress('#6A0DAD', HELMET_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.setLineDash([]);
  ctx.restore();
}
