// Procedural pixel character drawing for 4 types
// Each character is ~60px tall at scale=1, drawn centered at (x, y)

export type Pose = 'idle' | 'attack' | 'hit' | 'block' | 'dead';
export type Facing = 'left' | 'right';

// Knight colors
const K_ARMOR = '#4A90D9', K_DARK = '#2C5F8A', K_HELM = '#5B6B7A';
const K_SKIN = '#F5CBA7', K_SWORD = '#C0C0C0', K_SHIELD = '#B8860B';
const K_PLUME = '#E74C3C', K_EYE = '#222';

// Rogue colors
const R_CLOAK = '#3D2B56', R_LIGHT = '#7B68EE', R_HOOD = '#2C1E3F';
const R_SKIN = '#D4A574', R_DAGGER = '#A8A8A8', R_SCARF = '#2ECC71', R_EYE = '#222';

// Mage colors
const M_ROBE = '#8B1A1A', M_LIGHT = '#E74C3C', M_HAT = '#6B0F0F';
const M_SKIN = '#FDEBD0', M_STAFF = '#8B6914', M_ORB = '#00D4FF';
const M_BEARD = '#CCC', M_EYE = '#222';

// Berserker colors
const B_SKIN = '#D4A574', B_PAINT = '#E74C3C', B_PANTS = '#5D4037';
const B_HAIR = '#F39C12', B_AXE_HEAD = '#808080', B_AXE_HANDLE = '#6B4513';
const B_BELT = '#333', B_EYE = '#222';

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawKnight(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number, pose: Pose) {
  const bob = pose === 'idle' ? Math.sin(frame * 0.06) * 2 * s : 0;
  const ay = y + bob;

  px(ctx, x - 8*s, ay + 14*s, 6*s, 16*s, K_DARK);
  px(ctx, x + 2*s, ay + 14*s, 6*s, 16*s, K_DARK);
  px(ctx, x - 10*s, ay - 10*s, 20*s, 24*s, K_ARMOR);
  px(ctx, x - 8*s, ay - 8*s, 16*s, 20*s, K_DARK);
  px(ctx, x - 6*s, ay - 6*s, 12*s, 16*s, K_ARMOR);
  px(ctx, x - 7*s, ay - 24*s, 14*s, 14*s, K_HELM);
  px(ctx, x - 5*s, ay - 18*s, 10*s, 6*s, K_SKIN);
  px(ctx, x - 4*s, ay - 17*s, 8*s, 2*s, K_EYE);
  px(ctx, x - 2*s, ay - 28*s, 4*s, 6*s, K_PLUME);

  if (pose === 'attack') {
    const sw = Math.sin(frame * 0.3) * 12 * s;
    px(ctx, x + 12*s, ay - 14*s + sw, 4*s, 20*s, K_SWORD);
  } else if (pose === 'block') {
    px(ctx, x + 10*s, ay - 16*s, 8*s, 18*s, K_SHIELD);
  } else {
    px(ctx, x + 10*s, ay - 6*s, 3*s, 18*s, K_SWORD);
    px(ctx, x - 16*s, ay - 10*s, 6*s, 14*s, K_SHIELD);
  }
}

function drawRogue(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number, pose: Pose) {
  const bob = pose === 'idle' ? Math.sin(frame * 0.08) * 1.5 * s : 0;
  const ay = y + bob;

  px(ctx, x - 5*s, ay + 14*s, 4*s, 16*s, R_LIGHT);
  px(ctx, x + 1*s, ay + 14*s, 4*s, 16*s, R_LIGHT);
  px(ctx, x - 8*s, ay - 8*s, 16*s, 22*s, R_CLOAK);
  px(ctx, x - 4*s, ay - 10*s, 8*s, 4*s, R_SCARF);
  px(ctx, x - 8*s, ay - 26*s, 16*s, 16*s, R_HOOD);
  px(ctx, x - 5*s, ay - 20*s, 10*s, 8*s, R_SKIN);
  px(ctx, x - 3*s, ay - 17*s, 2*s, 2*s, R_EYE);
  px(ctx, x + 1*s, ay - 17*s, 2*s, 2*s, R_EYE);

  if (pose === 'attack') {
    const sw = Math.sin(frame * 0.4) * 8 * s;
    px(ctx, x + 10*s + sw, ay - 10*s, 3*s, 12*s, R_DAGGER);
    px(ctx, x - 14*s - sw, ay - 8*s, 3*s, 12*s, R_DAGGER);
  } else {
    px(ctx, x + 10*s, ay + 2*s, 2*s, 10*s, R_DAGGER);
    px(ctx, x - 12*s, ay + 2*s, 2*s, 10*s, R_DAGGER);
  }
}

function drawMage(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number, pose: Pose) {
  const bob = pose === 'idle' ? Math.sin(frame * 0.05) * 2 * s : 0;
  const ay = y + bob;

  px(ctx, x - 12*s, ay - 4*s, 24*s, 34*s, M_ROBE);
  px(ctx, x - 10*s, ay - 2*s, 20*s, 30*s, M_LIGHT);
  px(ctx, x - 10*s, ay + 4*s, 20*s, 3*s, '#FFD700');
  px(ctx, x - 6*s, ay - 18*s, 12*s, 14*s, M_SKIN);
  px(ctx, x - 4*s, ay - 8*s, 8*s, 6*s, M_BEARD);
  px(ctx, x - 4*s, ay - 14*s, 2*s, 2*s, M_EYE);
  px(ctx, x + 2*s, ay - 14*s, 2*s, 2*s, M_EYE);
  px(ctx, x - 8*s, ay - 22*s, 16*s, 6*s, M_HAT);
  px(ctx, x - 4*s, ay - 34*s, 8*s, 14*s, M_HAT);
  px(ctx, x - 2*s, ay - 36*s, 4*s, 4*s, M_HAT);

  const staffX = x + 14 * s;
  px(ctx, staffX, ay - 30*s, 3*s, 56*s, M_STAFF);

  const glow = 0.5 + 0.5 * Math.sin(frame * 0.1);
  ctx.fillStyle = M_ORB;
  ctx.globalAlpha = 0.3 + 0.4 * glow;
  ctx.beginPath();
  ctx.arc(staffX + 1.5*s, ay - 32*s, 5*s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  px(ctx, staffX - 1*s, ay - 35*s, 5*s, 5*s, M_ORB);

  if (pose === 'attack') {
    const fbx = staffX + 10*s + (frame % 20) * 2 * s;
    ctx.fillStyle = '#FF4500';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(fbx, ay - 10*s, 6*s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(fbx, ay - 10*s, 3*s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawBerserker(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number, pose: Pose) {
  const bob = pose === 'idle' ? Math.sin(frame * 0.07) * 2.5 * s : 0;
  const ay = y + bob;

  px(ctx, x - 7*s, ay + 12*s, 6*s, 18*s, B_PANTS);
  px(ctx, x + 1*s, ay + 12*s, 6*s, 18*s, B_PANTS);
  px(ctx, x - 10*s, ay + 8*s, 20*s, 4*s, B_BELT);
  px(ctx, x - 10*s, ay - 12*s, 20*s, 22*s, B_SKIN);
  px(ctx, x - 8*s, ay - 6*s, 4*s, 2*s, B_PAINT);
  px(ctx, x + 4*s, ay - 6*s, 4*s, 2*s, B_PAINT);
  px(ctx, x - 6*s, ay - 2*s, 12*s, 2*s, B_PAINT);
  px(ctx, x - 7*s, ay - 26*s, 14*s, 14*s, B_SKIN);
  px(ctx, x - 9*s, ay - 30*s, 18*s, 6*s, B_HAIR);
  px(ctx, x - 11*s, ay - 28*s, 4*s, 8*s, B_HAIR);
  px(ctx, x + 7*s, ay - 28*s, 4*s, 8*s, B_HAIR);
  px(ctx, x - 4*s, ay - 21*s, 3*s, 2*s, B_EYE);
  px(ctx, x + 1*s, ay - 21*s, 3*s, 2*s, B_EYE);
  px(ctx, x - 3*s, ay - 16*s, 6*s, 2*s, B_PAINT);

  if (pose === 'attack') {
    const swing = Math.sin(frame * 0.35) * 15 * s;
    ctx.save();
    ctx.translate(x + 14*s, ay - 8*s);
    ctx.rotate(swing * Math.PI / 180);
    px(ctx, 0, -24*s, 3*s, 36*s, B_AXE_HANDLE);
    px(ctx, -4*s, -28*s, 12*s, 8*s, B_AXE_HEAD);
    ctx.restore();
  } else {
    px(ctx, x + 12*s, ay - 24*s, 3*s, 36*s, B_AXE_HANDLE);
    px(ctx, x + 8*s, ay - 28*s, 12*s, 8*s, B_AXE_HEAD);
  }
}

const DRAW_FNS: Record<string, typeof drawKnight> = {
  knight: drawKnight, rogue: drawRogue, mage: drawMage, berserker: drawBerserker,
};

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  charType: string, x: number, y: number,
  scale: number, frame: number,
  pose: Pose, facing: Facing
) {
  ctx.save();
  ctx.translate(x, y);
  if (facing === 'left') ctx.scale(-1, 1);

  if (pose === 'hit') {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(frame * 0.8);
  }
  if (pose === 'dead') {
    ctx.globalAlpha = 0.3;
    ctx.translate(0, 10 * scale);
  }

  const draw = DRAW_FNS[charType];
  if (draw) draw(ctx, 0, 0, scale, frame, pose);

  ctx.restore();
}

export function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  current: number, max: number, color: string
) {
  const pct = Math.max(0, current / max);
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = pct > 0.5 ? color : pct > 0.25 ? '#F39C12' : '#E74C3C';
  ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}
