/**
 * Draws Andy (the boy) holding a small Woody doll.
 * Based on reference: a young boy holding Woody at his side,
 * about 1/3 his height.
 *
 * colorProgress 0.0 = pencil sketch, 1.0 = fully colored.
 */

export function drawAndyWithWoody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  frame: number,
  colorProgress: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // --- helpers ---
  const sectionAlpha = (threshold: number): number => {
    if (colorProgress <= threshold) return 0;
    return Math.min(1, (colorProgress - threshold) / 0.3);
  };

  const isPencil = colorProgress < 0.05;

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

  const fillOrSkip = (color: string, alpha: number) => {
    if (alpha <= 0) return false;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    return true;
  };

  // Colors
  const skinColor = '#FDBCB4';
  const hairColor = '#6B4226';
  const shirtColor = '#FFFFFF';
  const jeansColor = '#4A86C8';
  const shoeColor = '#444444';
  const woodyHat = '#8B6914';
  const woodyShirt = '#F5D442';
  const woodyVest = '#5C3A1E';
  const woodyJeans = '#4A6FA5';
  const woodyBoot = '#6B3A1E';

  // Andy dimensions — ~130px tall total
  // Head center at roughly (0, -100), feet at (0, 30)
  const headCY = -95;
  const headR = 16;
  const neckY = headCY + headR + 2;
  const shoulderY = neckY + 8;
  const torsoBottom = shoulderY + 36;
  const hipY = torsoBottom;
  const kneeY = hipY + 28;
  const footY = kneeY + 26;

  // Gentle idle bob
  const bob = Math.sin(frame * 0.04) * 1.5;

  ctx.save();
  ctx.translate(0, bob);

  // =====================
  // ANDY'S HAIR
  // =====================
  const hairAlpha = sectionAlpha(0.1);
  ctx.beginPath();
  ctx.arc(0, headCY - 2, headR + 3, Math.PI, 0);
  ctx.quadraticCurveTo(headR + 5, headCY - 8, headR + 2, headCY + 2);
  ctx.lineTo(-headR - 2, headCY + 2);
  ctx.closePath();
  if (fillOrSkip(hairColor, hairAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#4A2E14', 1.8);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // ANDY'S HEAD
  // =====================
  const skinAlpha = sectionAlpha(0.05);
  ctx.beginPath();
  ctx.ellipse(0, headCY, headR, headR + 2, 0, 0, Math.PI * 2);
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Face — eyes
  ctx.fillStyle = '#3A3A3A';
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(-5, headCY - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, headCY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(0, headCY + 2, 6, 0.15, Math.PI - 0.15);
  ctx.strokeStyle = '#3A3A3A';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.arc(-headR - 1, headCY, 4, 0, Math.PI * 2);
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(headR + 1, headCY, 4, 0, Math.PI * 2);
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // NECK
  // =====================
  ctx.beginPath();
  ctx.moveTo(-4, neckY - 4);
  ctx.lineTo(-4, shoulderY - 4);
  ctx.lineTo(4, shoulderY - 4);
  ctx.lineTo(4, neckY - 4);
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // ANDY'S T-SHIRT (white)
  // =====================
  const shirtAlpha = sectionAlpha(0.2);
  ctx.beginPath();
  ctx.moveTo(-18, shoulderY);
  ctx.lineTo(18, shoulderY);
  ctx.lineTo(16, torsoBottom);
  ctx.lineTo(-16, torsoBottom);
  ctx.closePath();
  if (fillOrSkip(shirtColor, shirtAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#CCCCCC', 1.8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Collar hint
  ctx.beginPath();
  ctx.moveTo(-8, shoulderY);
  ctx.quadraticCurveTo(0, shoulderY + 6, 8, shoulderY);
  if (isPencil) pencilStroke(); else solidStroke('#CCCCCC', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // ANDY'S LEFT ARM (viewer's right, hanging down)
  // =====================
  ctx.beginPath();
  ctx.moveTo(18, shoulderY + 2);
  ctx.lineTo(22, shoulderY + 20);
  ctx.lineTo(20, torsoBottom + 6);
  // hand
  ctx.lineTo(22, torsoBottom + 10);
  ctx.lineTo(16, torsoBottom + 10);
  ctx.lineTo(14, torsoBottom + 6);
  ctx.lineTo(14, shoulderY + 20);
  ctx.lineTo(18, shoulderY + 2);
  ctx.closePath();
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sleeve line
  ctx.beginPath();
  ctx.moveTo(14, shoulderY + 12);
  ctx.lineTo(22, shoulderY + 12);
  if (isPencil) pencilStroke(); else solidStroke('#CCCCCC', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // ANDY'S RIGHT ARM (viewer's left — holding Woody)
  // =====================
  // Arm bends to hold Woody against his side
  ctx.beginPath();
  ctx.moveTo(-18, shoulderY + 2);
  ctx.lineTo(-22, shoulderY + 16);
  ctx.lineTo(-20, torsoBottom - 2);
  // forearm angles in to hold Woody
  ctx.lineTo(-18, torsoBottom + 4);
  ctx.lineTo(-12, torsoBottom + 4);
  ctx.lineTo(-14, torsoBottom - 2);
  ctx.lineTo(-14, shoulderY + 16);
  ctx.lineTo(-18, shoulderY + 2);
  ctx.closePath();
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sleeve
  ctx.beginPath();
  ctx.moveTo(-14, shoulderY + 12);
  ctx.lineTo(-22, shoulderY + 12);
  if (isPencil) pencilStroke(); else solidStroke('#CCCCCC', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // WOODY DOLL (held by Andy's right arm)
  // Woody is about 1/3 Andy's height (~43px)
  // Positioned near Andy's left hip area
  // =====================
  const woodyX = -26;
  const woodyY = torsoBottom - 14;
  const ws = 0.33; // Woody scale relative to Andy

  ctx.save();
  ctx.translate(woodyX, woodyY);

  // Woody's hat
  const hatAlpha = sectionAlpha(0.4);
  ctx.beginPath();
  // Hat brim
  ctx.ellipse(0, -32 * ws, 14 * ws, 4 * ws, 0, 0, Math.PI * 2);
  if (fillOrSkip(woodyHat, hatAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#5C4010', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);
  // Hat crown
  ctx.beginPath();
  ctx.moveTo(-8 * ws, -33 * ws);
  ctx.quadraticCurveTo(-8 * ws, -50 * ws, 0, -48 * ws);
  ctx.quadraticCurveTo(8 * ws, -50 * ws, 8 * ws, -33 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyHat, hatAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#5C4010', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody's head
  ctx.beginPath();
  ctx.arc(0, -22 * ws, 7 * ws, 0, Math.PI * 2);
  if (fillOrSkip(skinColor, skinAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#D4948C', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody tiny eyes
  ctx.fillStyle = '#3A3A3A';
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(-2 * ws, -23 * ws, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2 * ws, -23 * ws, 1, 0, Math.PI * 2);
  ctx.fill();

  // Woody's yellow shirt
  const woodyShirtAlpha = sectionAlpha(0.45);
  ctx.beginPath();
  ctx.moveTo(-6 * ws, -15 * ws);
  ctx.lineTo(6 * ws, -15 * ws);
  ctx.lineTo(5 * ws, 4 * ws);
  ctx.lineTo(-5 * ws, 4 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyShirt, woodyShirtAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#C4A520', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody's vest (brown lines on shirt)
  const vestAlpha = sectionAlpha(0.5);
  if (vestAlpha > 0) {
    ctx.globalAlpha = vestAlpha;
    ctx.fillStyle = woodyVest;
    // Left vest panel
    ctx.fillRect(-6 * ws, -15 * ws, 2.5 * ws, 19 * ws);
    // Right vest panel
    ctx.fillRect(3.5 * ws, -15 * ws, 2.5 * ws, 19 * ws);
    ctx.globalAlpha = 1;
  }

  // Woody's bandana (red)
  const bandanaAlpha = sectionAlpha(0.48);
  ctx.beginPath();
  ctx.moveTo(-4 * ws, -15 * ws);
  ctx.lineTo(0, -12 * ws);
  ctx.lineTo(4 * ws, -15 * ws);
  if (fillOrSkip('#E74C3C', bandanaAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#B03A2E', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody's jeans
  const woodyJeansAlpha = sectionAlpha(0.5);
  ctx.beginPath();
  ctx.moveTo(-5 * ws, 4 * ws);
  ctx.lineTo(-6 * ws, 20 * ws);
  ctx.lineTo(-1 * ws, 20 * ws);
  ctx.lineTo(0, 4 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyJeans, woodyJeansAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#3A5A8A', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(0, 4 * ws);
  ctx.lineTo(1 * ws, 20 * ws);
  ctx.lineTo(6 * ws, 20 * ws);
  ctx.lineTo(5 * ws, 4 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyJeans, woodyJeansAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#3A5A8A', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody's boots
  const bootAlpha = sectionAlpha(0.55);
  ctx.beginPath();
  ctx.moveTo(-6 * ws, 20 * ws);
  ctx.lineTo(-7 * ws, 24 * ws);
  ctx.lineTo(-1 * ws, 24 * ws);
  ctx.lineTo(-1 * ws, 20 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyBoot, bootAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#4A2810', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(1 * ws, 20 * ws);
  ctx.lineTo(1 * ws, 24 * ws);
  ctx.lineTo(7 * ws, 24 * ws);
  ctx.lineTo(6 * ws, 20 * ws);
  ctx.closePath();
  if (fillOrSkip(woodyBoot, bootAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#4A2810', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Woody's arms (dangling)
  ctx.beginPath();
  ctx.moveTo(-6 * ws, -14 * ws);
  ctx.lineTo(-9 * ws, 2 * ws);
  ctx.moveTo(6 * ws, -14 * ws);
  ctx.lineTo(9 * ws, 2 * ws);
  if (isPencil) pencilStroke(); else solidStroke(skinColor, 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore(); // end Woody

  // =====================
  // ANDY'S JEANS
  // =====================
  const jeansAlpha = sectionAlpha(0.25);
  // Left leg
  ctx.beginPath();
  ctx.moveTo(-14, hipY);
  ctx.lineTo(-14, kneeY);
  ctx.lineTo(-12, footY - 4);
  ctx.lineTo(-2, footY - 4);
  ctx.lineTo(-2, kneeY);
  ctx.lineTo(-2, hipY);
  ctx.closePath();
  if (fillOrSkip(jeansColor, jeansAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#3A6A9A', 1.8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right leg
  ctx.beginPath();
  ctx.moveTo(2, hipY);
  ctx.lineTo(2, kneeY);
  ctx.lineTo(2, footY - 4);
  ctx.lineTo(12, footY - 4);
  ctx.lineTo(14, kneeY);
  ctx.lineTo(14, hipY);
  ctx.closePath();
  if (fillOrSkip(jeansColor, jeansAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#3A6A9A', 1.8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Belt line
  ctx.beginPath();
  ctx.moveTo(-16, hipY + 2);
  ctx.lineTo(16, hipY + 2);
  if (isPencil) pencilStroke(); else solidStroke('#3A3A3A', 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  // =====================
  // ANDY'S SNEAKERS
  // =====================
  const shoeAlpha = sectionAlpha(0.3);
  // Left shoe
  ctx.beginPath();
  ctx.moveTo(-14, footY - 4);
  ctx.lineTo(-16, footY);
  ctx.lineTo(-16, footY + 6);
  ctx.lineTo(0, footY + 6);
  ctx.lineTo(0, footY);
  ctx.lineTo(-2, footY - 4);
  ctx.closePath();
  if (fillOrSkip(shoeColor, shoeAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#2A2A2A', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sole line
  ctx.beginPath();
  ctx.moveTo(-16, footY + 3);
  ctx.lineTo(0, footY + 3);
  if (isPencil) pencilStroke(); else solidStroke('#EEEEEE', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right shoe
  ctx.beginPath();
  ctx.moveTo(2, footY - 4);
  ctx.lineTo(0, footY);
  ctx.lineTo(0, footY + 6);
  ctx.lineTo(16, footY + 6);
  ctx.lineTo(16, footY);
  ctx.lineTo(14, footY - 4);
  ctx.closePath();
  if (fillOrSkip(shoeColor, shoeAlpha)) ctx.fill();
  ctx.globalAlpha = 1;
  if (isPencil) pencilStroke(); else solidStroke('#2A2A2A', 1.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sole line
  ctx.beginPath();
  ctx.moveTo(0, footY + 3);
  ctx.lineTo(16, footY + 3);
  if (isPencil) pencilStroke(); else solidStroke('#EEEEEE', 1);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore(); // end bob

  // Reset state
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.restore();
}
