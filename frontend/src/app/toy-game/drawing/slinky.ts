/**
 * Draws Slinky Dog from Toy Story with progressive coloring.
 *
 * colorProgress 0.0-1.0 controls how "colored in" Slinky is:
 *   0.0 = pure pencil sketch (gray dashed outlines, no fill)
 *   0.5 = partial color (low alpha fills appearing)
 *   1.0 = fully colored
 *
 * Slinky is ~120px wide x 50px tall at scale=1 (long dachshund shape).
 * frame animates the spring bounce and tail wag.
 */
export function drawSlinky(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Section thresholds for progressive coloring
  const REAR_THRESHOLD = 0.05;
  const SPRING_THRESHOLD = 0.2;
  const FRONT_THRESHOLD = 0.35;
  const FACE_THRESHOLD = 0.5;
  const EARS_THRESHOLD = 0.65;
  const DETAILS_THRESHOLD = 0.8;

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

  // Animation values
  const springBounce = Math.sin(frame * 0.1) * 1.5;
  const tailWag = Math.sin(frame * 0.15) * 15;

  // Layout: center is (0,0), front half on the left, rear on the right
  // Total width ~120, height ~50
  // Front body center around x=-40, rear body center around x=40

  // ---- BACK LEGS ----
  setPencilOrColor('#A06A2E', REAR_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Back left leg
  ctx.beginPath();
  ctx.moveTo(34, 8);
  ctx.lineTo(32, 22);
  ctx.lineTo(28, 24);
  ctx.lineTo(38, 24);
  ctx.lineTo(36, 8);
  ctx.closePath();
  fillWithProgress('#C4883A', REAR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Back right leg
  setPencilOrColor('#A06A2E', REAR_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(46, 8);
  ctx.lineTo(44, 22);
  ctx.lineTo(40, 24);
  ctx.lineTo(50, 24);
  ctx.lineTo(48, 8);
  ctx.closePath();
  fillWithProgress('#C4883A', REAR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- REAR BODY ----
  setPencilOrColor('#A06A2E', REAR_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(40, 0, 18, 12, 0, 0, Math.PI * 2);
  fillWithProgress('#C4883A', REAR_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- TAIL (wagging, with curl/ball at tip) ----
  setPencilOrColor('#A06A2E', REAR_THRESHOLD);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.save();
  ctx.translate(56, -4);
  ctx.rotate((tailWag * Math.PI) / 180);
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -10, 4, -16);
  ctx.stroke();
  ctx.setLineDash([]);
  // Tail tip ball
  ctx.beginPath();
  ctx.arc(4, -16, 3, 0, Math.PI * 2);
  fillWithProgress('#C4883A', REAR_THRESHOLD);
  ctx.stroke();
  ctx.restore();

  // ---- SLINKY SPRING (coils connecting front and rear) ----
  // Draw overlapping ellipses from rear to front
  const springStartX = 22;
  const springEndX = -20;
  const numCoils = 8;
  const coilSpacing = (springStartX - springEndX) / numCoils;

  for (let i = 0; i < numCoils; i++) {
    const cx = springStartX - i * coilSpacing;
    // Slight vertical bounce per coil, offset by position
    const cy = springBounce * Math.sin(frame * 0.1 + i * 0.5) * 0.5;

    setPencilOrColor('#A0782A', SPRING_THRESHOLD);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, coilSpacing * 0.55, 8, 0, 0, Math.PI * 2);

    if (sectionAlpha(SPRING_THRESHOLD) >= 0.1) {
      // Colored spring with warm gold gradient feel
      ctx.save();
      ctx.globalAlpha = sectionAlpha(SPRING_THRESHOLD);
      ctx.fillStyle = i % 2 === 0 ? '#C4975A' : '#B8860B';
      ctx.fill();
      ctx.restore();
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---- FRONT LEGS ----
  setPencilOrColor('#A06A2E', FRONT_THRESHOLD);
  ctx.lineWidth = 1.8;

  // Front left leg
  ctx.beginPath();
  ctx.moveTo(-44, 8);
  ctx.lineTo(-46, 22);
  ctx.lineTo(-50, 24);
  ctx.lineTo(-40, 24);
  ctx.lineTo(-42, 8);
  ctx.closePath();
  fillWithProgress('#C4883A', FRONT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Front right leg
  setPencilOrColor('#A06A2E', FRONT_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-32, 8);
  ctx.lineTo(-34, 22);
  ctx.lineTo(-38, 24);
  ctx.lineTo(-28, 24);
  ctx.lineTo(-30, 8);
  ctx.closePath();
  fillWithProgress('#C4883A', FRONT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- FRONT BODY / HEAD ----
  // Neck and chest area
  setPencilOrColor('#A06A2E', FRONT_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-38, -2, 16, 14, 0, 0, Math.PI * 2);
  fillWithProgress('#C4883A', FRONT_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Head (slightly above and forward)
  setPencilOrColor('#A06A2E', FACE_THRESHOLD);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-46, -16, 14, 11, -0.15, 0, Math.PI * 2);
  fillWithProgress('#C4883A', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Snout / muzzle
  setPencilOrColor('#A06A2E', FACE_THRESHOLD);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-56, -12, 8, 6, -0.1, 0, Math.PI * 2);
  fillWithProgress('#D4A85A', FACE_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- EARS (big floppy, drooping down — dark chocolate brown) ----
  setPencilOrColor('#4A2008', EARS_THRESHOLD);
  ctx.lineWidth = 2;

  // Left ear (droops down on far side)
  ctx.beginPath();
  ctx.moveTo(-52, -22);
  ctx.quadraticCurveTo(-64, -20, -62, -6);
  ctx.quadraticCurveTo(-60, 0, -54, -8);
  ctx.quadraticCurveTo(-50, -14, -52, -22);
  ctx.closePath();
  fillWithProgress('#6B3410', EARS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right ear (droops down on near side)
  setPencilOrColor('#4A2008', EARS_THRESHOLD);
  ctx.beginPath();
  ctx.moveTo(-40, -22);
  ctx.quadraticCurveTo(-30, -18, -28, -6);
  ctx.quadraticCurveTo(-30, 0, -36, -8);
  ctx.quadraticCurveTo(-38, -14, -40, -22);
  ctx.closePath();
  fillWithProgress('#6B3410', EARS_THRESHOLD);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- FACE DETAILS ----
  // Eyes
  if (sectionAlpha(FACE_THRESHOLD) > 0.3) {
    const ea = sectionAlpha(FACE_THRESHOLD);
    ctx.save();
    ctx.globalAlpha = ea;
    // Eye whites (big, round, prominent)
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(-50, -19, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-42, -19, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pupils (brown/black)
    ctx.fillStyle = '#2A1506';
    ctx.beginPath();
    ctx.arc(-49, -19, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-41, -19, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-48, -20.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-40, -20.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Pencil eyes
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath();
    ctx.arc(-49, -19, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-42, -19, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  if (sectionAlpha(DETAILS_THRESHOLD) > 0.1) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(DETAILS_THRESHOLD);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(-60, -13, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath();
    ctx.ellipse(-60, -13, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth (smiling)
  const mouthColor = sectionAlpha(DETAILS_THRESHOLD) > 0.3 ? '#5A3A1A' : '#3A3A3A';
  ctx.strokeStyle = mouthColor;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(-55, -10, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // ---- COLLAR (green, like in the movie) ----
  if (sectionAlpha(DETAILS_THRESHOLD) > 0.1) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(DETAILS_THRESHOLD);
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(-38, -6, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    setPencilOrColor('#3A3A3A', DETAILS_THRESHOLD);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-38, -6, 12, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---- PAWS (little brown ovals at feet) ----
  if (sectionAlpha(FRONT_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(FRONT_THRESHOLD);
    ctx.fillStyle = '#A06A2E';
    // Front paws
    ctx.beginPath();
    ctx.ellipse(-45, 24, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-33, 24, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (sectionAlpha(REAR_THRESHOLD) > 0.3) {
    ctx.save();
    ctx.globalAlpha = sectionAlpha(REAR_THRESHOLD);
    ctx.fillStyle = '#A06A2E';
    // Back paws
    ctx.beginPath();
    ctx.ellipse(33, 24, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(45, 24, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Eyebrows (small arcs above eyes for friendly expression)
  const browColor = sectionAlpha(DETAILS_THRESHOLD) > 0.3 ? '#5A3A1A' : '#3A3A3A';
  ctx.strokeStyle = browColor;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(-50, -24, 4, 1.1 * Math.PI, 1.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-43, -24, 4, 1.1 * Math.PI, 1.9 * Math.PI);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}
