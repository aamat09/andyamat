import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

// ---- RETRO AUDIO ----
class RetroAudio {
  private ctx: AudioContext | null = null;
  private ensure() {
    if (!this.ctx) this.ctx = new AudioContext();
  }
  tone(freq: number, dur: number, type: OscillatorType = 'square') {
    this.ensure();
    const osc = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.06, this.ctx!.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + dur);
    osc.connect(g).connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + dur);
  }
  click() { this.tone(600, 0.08); setTimeout(() => this.tone(800, 0.06), 50); }
  reveal() { this.tone(400, 0.1); setTimeout(() => this.tone(600, 0.1), 70); setTimeout(() => this.tone(900, 0.12), 140); }
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'triangle'), i * 110)); }
  typeChar() { this.tone(280 + Math.random() * 180, 0.025); }
}

// ---- PIXEL DRAWING HELPERS ----
function drawBabyAndy(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, frame = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // slight waddle
  const wobble = Math.sin(frame * 0.15) * 3;
  ctx.rotate(wobble * Math.PI / 180);

  // Hat
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(-22, -48, 44, 14);
  ctx.fillRect(-16, -36, 32, 10);
  // Hat band
  ctx.fillStyle = '#f5d76e';
  ctx.fillRect(-22, -38, 44, 4);

  // Head
  ctx.fillStyle = '#fdd8b5';
  ctx.beginPath();
  ctx.arc(0, -16, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8c4a0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-6, -18, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -18, 2.5, 0, Math.PI * 2); ctx.fill();

  // Cheeks
  ctx.fillStyle = '#f8b4b466';
  ctx.beginPath(); ctx.arc(-11, -12, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(11, -12, 3, 0, Math.PI * 2); ctx.fill();

  // Mouth (smile)
  ctx.strokeStyle = '#e88';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -11, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#6bb5e0';
  roundRect(ctx, -15, -1, 30, 22, 6);
  ctx.fill();
  ctx.strokeStyle = '#5a9ec0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Star on body
  ctx.fillStyle = '#f5d76e';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 0, 14);

  // Legs
  ctx.fillStyle = '#fdd8b5';
  ctx.fillRect(-12, 21, 10, 12);
  ctx.fillRect(2, 21, 10, 12);

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = '#f0f7ffbb';
  ctx.beginPath();
  ctx.arc(x, y, w * 0.3, 0, Math.PI * 2);
  ctx.arc(x + w * 0.25, y - w * 0.15, w * 0.25, 0, Math.PI * 2);
  ctx.arc(x + w * 0.5, y, w * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
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

function drawDialogueBox(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  speaker: string, lines: string[],
  showNext: boolean, highlight?: { line: number; color: string },
  registryBtn = false,
) {
  const boxH = 130;
  const boxY = H - boxH - 16;
  const boxX = 16;
  const boxW = W - 32;

  // Box bg
  ctx.fillStyle = '#ffffffee';
  roundRect(ctx, boxX, boxY, boxW, boxH, 8);
  ctx.fill();
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Speaker
  ctx.fillStyle = '#8B6914';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('> ' + speaker, boxX + 12, boxY + 20);

  // Text lines
  ctx.font = '9px "Press Start 2P", monospace';
  lines.forEach((line, i) => {
    if (highlight && i === highlight.line) {
      ctx.fillStyle = highlight.color;
      // highlight bg
      const tw = ctx.measureText(line).width;
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(boxX + 12, boxY + 32 + i * 18, tw + 8, 16);
      ctx.fillStyle = '#e74c3c';
    } else {
      ctx.fillStyle = '#4a4a6a';
    }
    ctx.fillText(line, boxX + 14, boxY + 44 + i * 18);
  });

  // Registry button
  if (registryBtn) {
    const btnY = boxY + boxH - 34;
    const btnX = boxX + 12;
    const btnW = 160;
    ctx.fillStyle = '#6bb5e0';
    roundRect(ctx, btnX, btnY, btnW, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('VIEW REGISTRY', btnX + 10, btnY + 16);
  }

  // Next arrow
  if (showNext) {
    ctx.fillStyle = '#6bb5e0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('NEXT >', boxX + boxW - 12, boxY + boxH - 12);
  }
}

// ---- SCENES ----
type Scene = 'title' | 'intro' | 'calendar' | 'map' | 'gift' | 'rsvp' | 'confirm' | 'decline';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  private W = 480;
  private H = 720;
  private frame = 0;
  private animId = 0;
  private audio = new RetroAudio();
  private inviteId = '';
  private guestName = '';

  scene: Scene = 'title';
  showRsvp = false;
  rsvpName = '';
  rsvpGuests = 0;
  rsvpAttending: boolean | null = null;

  // scene-specific state
  private titleBlink = true;
  private introText = '';
  private introTarget = "Howdy! I'm Baby Andy! I ain't here yet, but I'm already planning my first big party! Wanna come along?";
  private introTyped = 0;
  private introReady = false;
  private calCircled = false;
  private calDialogue = false;
  private mapRevealed = false;
  private mapDialogue = false;
  private giftOpened = false;
  private giftDialogue = false;
  private confirmFireworks: { x: number; y: number; color: string; t: number }[] = [];

  // cloud positions
  private clouds = [
    { x: -50, y: 50, w: 80, speed: 0.3 },
    { x: 200, y: 80, w: 60, speed: 0.2 },
    { x: 400, y: 35, w: 100, speed: 0.35 },
  ];

  // stars
  private stars: { x: number; y: number; r: number; phase: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private zone: NgZone,
  ) {
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H * 0.6,
        r: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext('2d')!;

    this.route.paramMap.subscribe(params => {
      this.inviteId = params.get('id') || '';
      if (this.inviteId) {
        // Record the view
        this.api.recordView(this.inviteId).subscribe({
          error: () => {} // silent fail if API not running
        });
        // Get guest name
        this.api.getInvite(this.inviteId).subscribe({
          next: inv => { this.guestName = inv.guest_name; },
          error: () => { this.guestName = 'Partner'; }
        });
      }
    });

    this.zone.runOutsideAngular(() => {
      this.loop();
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
  }

  private loop() {
    this.frame++;
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  // ---- RENDERING ----
  private render() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    switch (this.scene) {
      case 'title': this.renderTitle(ctx, W, H); break;
      case 'intro': this.renderIntro(ctx, W, H); break;
      case 'calendar': this.renderCalendar(ctx, W, H); break;
      case 'map': this.renderMap(ctx, W, H); break;
      case 'gift': this.renderGift(ctx, W, H); break;
      case 'rsvp': this.renderRsvp(ctx, W, H); break;
      case 'confirm': this.renderConfirm(ctx, W, H); break;
      case 'decline': this.renderDecline(ctx, W, H); break;
    }
  }

  private drawSkyAndGround(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#d4e9f7');
    grad.addColorStop(0.7, '#a8d4f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > W + 60) c.x = -80;
      drawCloud(ctx, c.x, c.y, c.w);
    });

    // Ground
    ctx.fillStyle = '#7ec88b';
    ctx.fillRect(0, H - 100, W, 100);
    ctx.fillStyle = '#5ba86c';
    ctx.fillRect(0, H - 100, W, 4);
  }

  private drawProgress(ctx: CanvasRenderingContext2D, W: number, step: number, total = 4) {
    const dotR = 5;
    const gap = 16;
    const startX = W / 2 - ((total - 1) * gap) / 2;
    for (let i = 0; i < total; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * gap, 18, dotR, 0, Math.PI * 2);
      if (i < step) {
        ctx.fillStyle = '#f5d76e';
        ctx.strokeStyle = '#8B6914';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // ---- TITLE ----
  private renderTitle(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Night sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a1a3e');
    grad.addColorStop(0.5, '#2d2d6b');
    grad.addColorStop(1, '#a8d4f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    this.stars.forEach(s => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(this.frame * 0.02 + s.phase));
      drawStar(ctx, s.x, s.y, s.r, alpha);
    });

    // Title
    ctx.fillStyle = '#f5d76e';
    ctx.font = '32px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#6B4F10';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    const floatY = Math.sin(this.frame * 0.03) * 6;
    ctx.fillText('A Boy', W / 2, H * 0.28 + floatY);
    ctx.fillText('Story', W / 2, H * 0.28 + 44 + floatY);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Subtitle
    ctx.fillStyle = '#f0f7ffdd';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText("Welcome to Andy's", W / 2, H * 0.42);
    ctx.fillText('Baby Shower', W / 2, H * 0.42 + 20);

    // Baby Andy
    drawBabyAndy(ctx, W / 2, H * 0.58, 1.2, 0);

    // Blink "TAP TO START"
    if (Math.floor(this.frame / 30) % 2 === 0) {
      ctx.fillStyle = '#f5d76e';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('TAP TO START', W / 2, H * 0.82);
      // Border around text
      ctx.strokeStyle = '#f5d76e';
      ctx.lineWidth = 2;
      roundRect(ctx, W / 2 - 110, H * 0.82 - 18, 220, 32, 4);
      ctx.stroke();
    }
  }

  // ---- INTRO ----
  private renderIntro(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    this.drawProgress(ctx, W, 1);

    // Baby Andy walking
    drawBabyAndy(ctx, W / 2, H * 0.35, 1.3, this.frame);

    // Typewriter effect
    if (this.introTyped < this.introTarget.length) {
      this.introTyped++;
      this.introText = this.introTarget.slice(0, this.introTyped);
      if (this.introTyped % 2 === 0) this.audio.typeChar();
      if (this.introTyped === this.introTarget.length) {
        this.introReady = true;
      }
    }

    // Wrap text into lines
    const lines = this.wrapText(this.introText, W - 70, '9px "Press Start 2P", monospace');
    drawDialogueBox(ctx, W, H, 'BABY ANDY', lines, this.introReady);
  }

  // ---- CALENDAR ----
  private renderCalendar(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    this.drawProgress(ctx, W, 2);

    // Scene title
    ctx.fillStyle = '#4a4a6a';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Help me circle', W / 2, 60);
    ctx.fillText('the date!', W / 2, 78);

    // Calendar
    const calX = W / 2 - 90;
    const calY = 110;
    const calW = 180;
    const calH = 200;

    // Calendar bg
    ctx.fillStyle = '#fff';
    roundRect(ctx, calX, calY, calW, calH, 6);
    ctx.fill();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Header
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(calX + 3, calY + 3, calW - 6, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MAY 2026', W / 2, calY + 22);

    // Day labels
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    ctx.fillStyle = '#999';
    ctx.font = '7px "Press Start 2P", monospace';
    days.forEach((d, i) => {
      ctx.fillText(d, calX + 16 + i * 22, calY + 52);
    });

    // Day numbers — May 2026 starts on Friday (index 5)
    const startDay = 5;
    ctx.font = '8px "Press Start 2P", monospace';
    for (let d = 1; d <= 31; d++) {
      const pos = startDay + d - 1;
      const col = pos % 7;
      const row = Math.floor(pos / 7);
      const dx = calX + 16 + col * 22;
      const dy = calY + 70 + row * 22;

      if (d === 2) {
        // Highlight day 2
        ctx.fillStyle = '#f5d76e';
        ctx.beginPath();
        ctx.arc(dx, dy - 3, 10, 0, Math.PI * 2);
        ctx.fill();

        if (this.calCircled) {
          // Red circle
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(dx, dy - 3, 13, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillText(String(d), dx, dy);
        ctx.font = '8px "Press Start 2P", monospace';
      } else {
        ctx.fillStyle = '#4a4a6a';
        ctx.fillText(String(d), dx, dy);
      }
    }

    if (!this.calCircled) {
      // Tap hint
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#4a4a6a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('TAP THE CALENDAR', W / 2, calY + calH + 30);
      }
    }

    if (this.calDialogue) {
      drawDialogueBox(ctx, W, H, 'BABY ANDY', [
        "That's when my",
        'party is!',
        '',
        'May 2nd, 2026',
        'at 2:30 PM!',
      ], true, { line: 3, color: '#e74c3c' });
    }
  }

  // ---- MAP ----
  private renderMap(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    this.drawProgress(ctx, W, 3);

    ctx.fillStyle = '#4a4a6a';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('X marks the spot!', W / 2, 60);

    // Treasure map
    const mapX = W / 2 - 100;
    const mapY = 100;
    const mapW = 200;
    const mapH = 160;

    ctx.fillStyle = '#f5e6c8';
    roundRect(ctx, mapX, mapY, mapW, mapH, 4);
    ctx.fill();
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dashed border inside
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#8B691444';
    roundRect(ctx, mapX + 8, mapY + 8, mapW - 16, mapH - 16, 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dashed paths
    ctx.strokeStyle = '#8B691444';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(mapX + 20, mapY + 30);
    ctx.lineTo(mapX + 80, mapY + 60);
    ctx.lineTo(mapX + 120, mapY + 40);
    ctx.lineTo(mapX + mapW / 2, mapY + mapH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // X or star
    ctx.textAlign = 'center';
    if (this.mapRevealed) {
      ctx.fillStyle = '#7ec88b';
      ctx.font = '40px sans-serif';
      ctx.fillText('★', mapX + mapW / 2, mapY + mapH / 2 + 14);
    } else {
      const pulse = 1 + Math.sin(this.frame * 0.05) * 0.08;
      ctx.save();
      ctx.translate(mapX + mapW / 2, mapY + mapH / 2 + 10);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#e74c3c';
      ctx.font = '42px "Press Start 2P", monospace';
      ctx.fillText('X', 0, 0);
      ctx.restore();
    }

    if (!this.mapRevealed) {
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#4a4a6a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAP THE MAP', W / 2, mapY + mapH + 30);
      }
    }

    if (this.mapDialogue) {
      drawDialogueBox(ctx, W, H, 'BABY ANDY', [
        "The adventure",
        "begins at...",
        '',
        "Emy's Place",
        "9101 SW 45th St",
        "Miami, FL 33165",
      ], true, { line: 3, color: '#e74c3c' });
    }
  }

  // ---- GIFT ----
  private renderGift(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    this.drawProgress(ctx, W, 4);

    ctx.fillStyle = '#4a4a6a';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Every cowboy', W / 2, 60);
    ctx.fillText('needs supplies!', W / 2, 78);

    const gx = W / 2;
    const gy = 200;

    ctx.save();
    if (this.giftOpened) {
      const shake = Math.sin(this.frame * 0.5) * (Math.max(0, 20 - (this.frame % 100)) * 0.3);
      ctx.translate(shake, 0);
    }

    // Gift box
    ctx.fillStyle = '#6bb5e0';
    roundRect(ctx, gx - 55, gy, 110, 80, 4);
    ctx.fill();
    ctx.strokeStyle = '#4a8eb0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ribbon vertical
    ctx.fillStyle = '#f5d76e';
    ctx.fillRect(gx - 8, gy, 16, 80);

    // Ribbon horizontal
    ctx.fillRect(gx - 55, gy + 32, 110, 16);

    // Bow
    ctx.strokeStyle = '#f5d76e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(gx - 14, gy - 6, 16, 12, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx + 14, gy - 6, 16, 12, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Bow center
    ctx.fillStyle = '#f5d76e';
    ctx.beginPath();
    ctx.arc(gx, gy - 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4b84e';
    ctx.stroke();

    ctx.restore();

    if (!this.giftOpened) {
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#4a4a6a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('TAP THE GIFT', W / 2, gy + 110);
      }
    }

    if (this.giftDialogue) {
      drawDialogueBox(ctx, W, H, 'BABY ANDY', [
        'To infinity...',
        'and the registry!',
        '',
        'Check out my',
        'wishlist, partner!',
      ], true, undefined, true);
    }
  }

  // ---- RSVP (clean background behind the DOM overlay) ----
  private renderRsvp(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    drawBabyAndy(ctx, W / 2, H * 0.28, 1, this.frame);
  }

  // ---- CONFIRM ----
  private renderConfirm(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Night sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a1a3e');
    grad.addColorStop(0.6, '#2d2d6b');
    grad.addColorStop(1, '#a8d4f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    this.stars.forEach(s => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(this.frame * 0.02 + s.phase));
      drawStar(ctx, s.x, s.y, s.r, alpha);
    });

    // Fireworks
    this.confirmFireworks.forEach(fw => {
      fw.t += 0.02;
      const burst = Math.min(fw.t * 60, 50);
      const alpha = Math.max(0, 1 - fw.t);
      ctx.fillStyle = fw.color;
      ctx.globalAlpha = alpha;
      for (let a = 0; a < 9; a++) {
        const angle = (a / 9) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fw.x + Math.cos(angle) * burst, fw.y + Math.sin(angle) * burst, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
    // Respawn dead fireworks
    this.confirmFireworks = this.confirmFireworks.filter(fw => fw.t < 1.5);
    if (this.frame % 40 === 0 && this.confirmFireworks.length < 6) {
      this.confirmFireworks.push({
        x: 80 + Math.random() * (W - 160),
        y: 60 + Math.random() * (H * 0.4),
        color: ['#f5d76e', '#e74c3c', '#6bb5e0', '#7ec88b', '#f2a7b3'][Math.floor(Math.random() * 5)],
        t: 0,
      });
    }

    drawBabyAndy(ctx, W / 2, H * 0.32, 1.3, 0);

    ctx.fillStyle = '#f5d76e';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00000044';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('YEE-HAW!', W / 2, H * 0.5);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#f0f7ffdd';
    ctx.font = '9px "Press Start 2P", monospace';
    const infoLines = [
      'Thanks, partner!',
      '',
      'See ya on May 2nd',
      'at 2:30 PM!',
      '',
      "Emy's Place",
      '9101 SW 45th St',
      'Miami, FL 33165',
    ];
    infoLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, H * 0.56 + i * 18);
    });

    // Add to calendar button
    ctx.strokeStyle = '#f0f7ffcc';
    ctx.lineWidth = 2;
    const btnY = H * 0.56 + infoLines.length * 18 + 20;
    roundRect(ctx, W / 2 - 100, btnY, 200, 32, 4);
    ctx.stroke();
    ctx.fillStyle = '#f0f7ffcc';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('ADD TO CALENDAR', W / 2, btnY + 21);
  }

  // ---- DECLINE ----
  private renderDecline(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.drawSkyAndGround(ctx, W, H);
    drawBabyAndy(ctx, W / 2, H * 0.35, 1.3, 0);

    ctx.fillStyle = '#4a4a6a';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    const lines = ['Aw shucks...', '', "We'll miss ya,", 'partner!', '', 'Maybe next rodeo!'];
    lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.55 + i * 24));
  }

  // ---- TAP HANDLER ----
  onTap(event: Event) {
    event.preventDefault();

    // Get tap position relative to canvas
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = this.W / rect.width;
    const scaleY = this.H / rect.height;

    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }
    const tapX = (clientX - rect.left) * scaleX;
    const tapY = (clientY - rect.top) * scaleY;

    switch (this.scene) {
      case 'title':
        this.audio.click();
        this.scene = 'intro';
        this.introTyped = 0;
        this.introText = '';
        this.introReady = false;
        break;

      case 'intro':
        if (!this.introReady) {
          // Skip typewriter
          this.introTyped = this.introTarget.length;
          this.introText = this.introTarget;
          this.introReady = true;
        } else {
          this.audio.click();
          this.scene = 'calendar';
        }
        break;

      case 'calendar':
        if (!this.calCircled) {
          this.audio.reveal();
          this.calCircled = true;
          setTimeout(() => { this.calDialogue = true; }, 300);
        } else if (this.calDialogue) {
          this.audio.click();
          this.scene = 'map';
        }
        break;

      case 'map':
        if (!this.mapRevealed) {
          this.audio.reveal();
          this.mapRevealed = true;
          setTimeout(() => { this.mapDialogue = true; }, 300);
        } else if (this.mapDialogue) {
          this.audio.click();
          this.scene = 'gift';
        }
        break;

      case 'gift':
        if (!this.giftOpened) {
          this.audio.reveal();
          this.giftOpened = true;
          setTimeout(() => { this.giftDialogue = true; }, 300);
        } else if (this.giftDialogue) {
          // Check if tapped registry button area
          const btnY = this.H - 130 - 16 + 130 - 34;
          const btnX = 28;
          if (tapX >= btnX && tapX <= btnX + 160 && tapY >= btnY && tapY <= btnY + 24) {
            window.open('https://www.amazon.com/baby-reg/sabrina-fonstecilla-june-2026-miami/3BIOJ51KE3ACA', '_blank');
            return;
          }
          // Next → RSVP
          this.audio.click();
          this.zone.run(() => { this.showRsvp = true; });
          this.scene = 'rsvp';
        }
        break;

      case 'confirm':
        // Add to calendar tap
        const infoLines = 8;
        const calBtnY = this.H * 0.56 + infoLines * 18 + 20;
        if (tapY >= calBtnY && tapY <= calBtnY + 32 && tapX >= this.W / 2 - 100 && tapX <= this.W / 2 + 100) {
          this.addToCalendar();
        }
        break;
    }
  }

  canSubmit(): boolean {
    return !!(this.rsvpName.trim() && this.rsvpGuests > 0 && this.rsvpAttending !== null);
  }

  submitRsvp() {
    if (!this.canSubmit()) return;

    this.api.submitRsvp({
      invitation_id: this.inviteId,
      name: this.rsvpName.trim(),
      num_guests: this.rsvpGuests,
      attending: this.rsvpAttending!,
    }).subscribe({
      next: () => this.afterSubmit(),
      error: () => this.afterSubmit(), // still show confirmation if API is down
    });
  }

  private afterSubmit() {
    this.showRsvp = false;
    if (this.rsvpAttending) {
      this.audio.fanfare();
      this.scene = 'confirm';
    } else {
      this.scene = 'decline';
    }
  }

  private addToCalendar() {
    this.audio.click();
    const start = '20260502T143000';
    const end = '20260502T173000';
    const title = encodeURIComponent("A Boy Story - Andy's Baby Shower");
    const location = encodeURIComponent("Emy's Place, 9101 SW 45th St, Miami, FL 33165");
    const details = encodeURIComponent('Baby Andy\'s shower! Registry: https://www.amazon.com/baby-reg/sabrina-fonstecilla-june-2026-miami/3BIOJ51KE3ACA');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
    window.open(url, '_blank');
  }

  private wrapText(text: string, maxW: number, font: string): string[] {
    const ctx = this.ctx;
    ctx.font = font;
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const word of words) {
      const test = cur ? cur + ' ' + word : word;
      if (ctx.measureText(test).width > maxW) {
        if (cur) lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
}
