import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseGameEngine } from '../shared/base-game.engine';
import { ToyAudio } from './audio/toy-audio';
import { drawWoody } from './drawing/woody';
import { drawBuzz } from './drawing/buzz';
import { drawRex } from './drawing/rex';
import { drawJessie } from './drawing/jessie';
import { drawPotatoHead } from './drawing/potato';
import { drawSlinky } from './drawing/slinky';
import { drawAndyWithWoody } from './drawing/andy-woody';
import { drawAndysRoom, drawBedroomDoor, drawPizzaPlanetMap, drawToyBox, drawAndysRoomDetailed } from './drawing/scenes';
import { drawDialogueBox, drawProgress, roundRect } from './drawing/ui';

@Component({
  selector: 'app-toy-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toy-game.component.html',
  styleUrl: './toy-game.component.scss',
})
export class ToyGameComponent extends BaseGameEngine {
  private audio = new ToyAudio();

  // Per-scene character coloring (each scene has its own 0→1 progress)
  private sceneColorTargets: Record<string, number> = {};
  private sceneColorCurrent: Record<string, number> = {};

  // Character sprite images
  private sprites: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};

  // Confirm scene
  private confettiParticles: { x: number; y: number; vx: number; vy: number; color: string; rot: number; rotV: number }[] = [];

  protected get introTarget(): string {
    return "Howdy partner! I'm Woody, Andy's favorite toy. The gang and I are rounding up friends for Baby Andy's big arrival! Wanna help?";
  }

  protected override get calendarTitle(): string {
    return "Andy's Coming Soon! - Baby Shower";
  }

  protected override onInit() {
    ['woody', 'buzz', 'rex', 'jessie', 'potato', 'slinky', 'toystory-group'].forEach(name => {
      const img = new Image();
      this.sprites[name] = { img, loaded: false };
      img.onload = () => { this.sprites[name].loaded = true; };
      img.src = `${name}.png`;
    });
  }

  /** Draw a sprite centered at (cx, cy) with given height, preserving aspect ratio. Gentle bob animation. */
  private drawSprite(ctx: CanvasRenderingContext2D, name: string, cx: number, cy: number, h: number) {
    const s = this.sprites[name];
    if (!s?.loaded) return;
    const w = h * (s.img.naturalWidth / s.img.naturalHeight);
    // Each character gets a unique phase offset so they bob out of sync
    const phase = name.charCodeAt(0) * 1.3;
    const bob = Math.sin(this.frame * 0.04 + phase) * 4;
    ctx.drawImage(s.img, cx - w / 2, cy - h / 2 + bob, w, h);
  }

  protected override onEmailDone() {
    this.audio.fanfare();
  }

  // ---- PER-SCENE COLOR PROGRESS ----

  private getColor(key: string): number {
    return this.sceneColorCurrent[key] || 0;
  }

  private setSceneColorTarget(key: string, target: number) {
    const prev = this.sceneColorTargets[key] || 0;
    if (target > prev) {
      this.sceneColorTargets[key] = target;
      if (prev === 0) this.audio.colorIn(); // play sound on first color-in
    }
  }

  private updateSceneColor(key: string) {
    const target = this.sceneColorTargets[key] || 0;
    const current = this.sceneColorCurrent[key] || 0;
    if (current < target) {
      this.sceneColorCurrent[key] = Math.min(target, current + 0.02);
    }
  }

  // ---- RENDER SCENES ----

  protected renderTitle(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawBedroomDoor(ctx, W, H, this.frame);

    ctx.fillStyle = '#FFD700';
    ctx.font = '700 28px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const floatY = Math.sin(this.frame * 0.03) * 5;
    ctx.fillText("Andy's", W / 2, H * 0.82 + floatY);
    ctx.fillText('Coming Soon!', W / 2, H * 0.82 + 32 + floatY);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '600 13px "Nunito", sans-serif';
    ctx.fillText("Welcome to Andy's Baby Shower", W / 2, H * 0.82 + 56);

    if (Math.floor(this.frame / 30) % 2 === 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '700 14px "Fredoka One", sans-serif';
      ctx.fillText('TAP TO START', W / 2, H * 0.95);
    }
  }

  // Scene 1: WOODY introduces the party
  protected renderIntro(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);
    drawProgress(ctx, W, 1);

    this.drawSprite(ctx, 'woody', W / 2, H * 0.38, 450);

    this.tickTypewriter();
    if (this.introTyped < this.introTarget.length && this.introTyped % 2 === 0) {
      this.audio.typeChar();
    }

    const lines = this.wrapText(this.introText, W - 70, '600 13px "Nunito", sans-serif');
    drawDialogueBox(ctx, W, H, 'WOODY', lines, this.introReady);
  }

  // Scene 2: BUZZ helps circle the date
  protected renderCalendar(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);
    drawProgress(ctx, W, 2);

    // Buzz sketches in and colors
    this.setSceneColorTarget('buzz', 1.0);
    this.updateSceneColor('buzz');

    ctx.fillStyle = '#3D2B1F';
    ctx.font = '700 14px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('To infinity... and the date!', W / 2, 55);

    // Calendar
    const calX = W / 2 - 95;
    const calY = 80;
    const calW = 190;
    const calH = 210;

    ctx.fillStyle = '#FFF';
    roundRect(ctx, calX, calY, calW, calH, 6);
    ctx.fill();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thumbtack
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(W / 2, calY - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.arc(W / 2, calY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Header
    ctx.fillStyle = '#5B9BD5';
    roundRect(ctx, calX + 2, calY + 2, calW - 4, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '700 13px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAY 2026', W / 2, calY + 22);

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    ctx.fillStyle = '#999';
    ctx.font = '600 10px "Nunito", sans-serif';
    days.forEach((d, i) => ctx.fillText(d, calX + 18 + i * 23, calY + 50));

    const startDay = 5;
    ctx.font = '700 11px "Nunito", sans-serif';
    for (let d = 1; d <= 31; d++) {
      const pos = startDay + d - 1;
      const col = pos % 7;
      const row = Math.floor(pos / 7);
      const dx = calX + 18 + col * 23;
      const dy = calY + 68 + row * 23;

      if (d === 2) {
        ctx.fillStyle = '#FFF8E7';
        ctx.beginPath();
        ctx.arc(dx, dy - 3, 11, 0, Math.PI * 2);
        ctx.fill();

        if (this.calCircled) {
          ctx.strokeStyle = '#E74C3C';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.1) {
            const wobble = Math.sin(a * 3) * 1.5;
            const r = 14 + wobble;
            if (a === 0) ctx.moveTo(dx + r * Math.cos(a), dy - 3 + r * Math.sin(a));
            else ctx.lineTo(dx + r * Math.cos(a), dy - 3 + r * Math.sin(a));
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.fillStyle = '#E74C3C';
        ctx.font = '800 11px "Nunito", sans-serif';
        ctx.fillText(String(d), dx, dy);
        ctx.font = '700 11px "Nunito", sans-serif';
      } else {
        ctx.fillStyle = '#3D2B1F';
        ctx.fillText(String(d), dx, dy);
      }
    }

    if (!this.calCircled) {
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#3D2B1F';
        ctx.font = '600 11px "Nunito", sans-serif';
        ctx.fillText('TAP THE CALENDAR', W / 2, calY + calH + 25);
      }
    }

    if (this.calDialogue) {
      drawDialogueBox(ctx, W, H, 'BUZZ', [
        'To infinity...',
        'and May 2nd!',
        '',
        'May 2nd, 2026',
        'at 2:30 PM',
        '',
        "Mission date: locked in!",
      ], true, { line: 3, color: '#E74C3C' });
    }

    // Buzz in corner
    this.drawSprite(ctx, 'buzz', 85, H * 0.58, 300);
  }

  // Scene 3: REX nervously shows the map
  protected renderMap(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);
    drawProgress(ctx, W, 3);

    this.setSceneColorTarget('rex', 1.0);
    this.updateSceneColor('rex');

    ctx.fillStyle = '#3D2B1F';
    ctx.font = '700 14px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Don't get lost!", W / 2, 55);

    const mapX = W / 2 - 110;
    const mapY = 90;
    const mapW = 220;
    const mapH = 170;

    drawPizzaPlanetMap(ctx, W, H, mapX, mapY, mapW, mapH, this.mapRevealed, this.frame);

    if (!this.mapRevealed) {
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#3D2B1F';
        ctx.font = '600 11px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TAP THE MAP', W / 2, mapY + mapH + 25);
      }
    }

    if (this.mapDialogue) {
      drawDialogueBox(ctx, W, H, 'REX', [
        "Oh oh oh! I found it!",
        "Don't worry, I won't",
        'get us lost!',
        '',
        "Emy's Place",
        '9101 SW 45th St',
        'Miami, FL 33165',
      ], true, { line: 4, color: '#E74C3C' });
    }

    // Rex in corner
    this.drawSprite(ctx, 'rex', W - 230, H * 0.62, 360);
  }

  // Scene 4: JESSIE shows the registry
  protected renderGift(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);
    drawProgress(ctx, W, 4);

    this.setSceneColorTarget('jessie', 1.0);
    this.updateSceneColor('jessie');

    ctx.fillStyle = '#3D2B1F';
    ctx.font = '700 14px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Yee-haw! Gift time!', W / 2, 55);

    drawToyBox(ctx, W, H, W / 2, 130, this.giftOpened, this.frame);

    if (!this.giftOpened) {
      if (Math.floor(this.frame / 25) % 2 === 0) {
        ctx.fillStyle = '#3D2B1F';
        ctx.font = '600 11px "Nunito", sans-serif';
        ctx.fillText('TAP THE TOY BOX', W / 2, 280);
      }
    }

    if (this.giftDialogue) {
      drawDialogueBox(ctx, W, H, 'JESSIE', [
        'Yee-haw! Every toy',
        'needs a home!',
        '',
        'Check out the wishlist —',
        'find the perfect',
        'friend for Andy!',
      ], true, undefined, true);
    }

    // Jessie next to toy box
    this.drawSprite(ctx, 'jessie', 130, H * 0.58, 280);
  }

  // Scene 5: MR. POTATO HEAD behind RSVP form
  protected renderRsvp(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);

    this.setSceneColorTarget('potato', 1.0);
    this.updateSceneColor('potato');

    this.drawSprite(ctx, 'potato', W / 2, H * 0.3, 350);
  }

  // Scene 6: CONFIRM — all characters together in detailed room
  protected renderConfirm(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Detailed room background, fully colored
    drawAndysRoomDetailed(ctx, W, H, 1.0);

    // Confetti
    if (this.confettiParticles.length < 30 && this.frame % 8 === 0) {
      this.confettiParticles.push({
        x: Math.random() * W,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 2,
        color: ['#FFD700', '#E74C3C', '#5B9BD5', '#7CFC00', '#9370DB', '#FF69B4'][Math.floor(Math.random() * 6)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.2,
      });
    }
    this.confettiParticles.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.rot += c.rotV;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    });
    this.confettiParticles = this.confettiParticles.filter(c => c.y < H + 20);

    // Group image — all characters together
    const gs = this.sprites['toystory-group'];
    if (gs?.loaded) {
      const imgH = H * 0.42;
      const imgW = imgH * (gs.img.naturalWidth / gs.img.naturalHeight);
      ctx.drawImage(gs.img, W / 2 - imgW / 2, H * 0.75 - imgH, imgW, imgH);
    }

    // "You've got a friend in us!"
    ctx.fillStyle = '#FFD700';
    ctx.font = '700 18px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText("You've got a", W / 2, H * 0.08);
    ctx.fillText('friend in us!', W / 2, H * 0.08 + 24);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#3D2B1F';
    ctx.font = '600 12px "Nunito", sans-serif';
    const infoLines = [
      'Thanks for joining the adventure!',
      '',
      'See you May 2nd at 2:30 PM!',
      '',
      "Emy's Place",
      '9101 SW 45th St, Miami, FL 33165',
    ];
    infoLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, H * 0.72 + i * 16);
    });

    // Calendar button
    const btnY = H * 0.72 + infoLines.length * 16 + 10;
    ctx.fillStyle = '#FFD700';
    roundRect(ctx, W / 2 - 100, btnY, 200, 32, 16);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    roundRect(ctx, W / 2 - 100, btnY, 200, 32, 16);
    ctx.stroke();
    ctx.fillStyle = '#8B4513';
    ctx.font = '700 11px "Fredoka One", sans-serif';
    ctx.fillText('ADD TO CALENDAR', W / 2, btnY + 21);
  }

  // Scene 7: DECLINE — Slinky Dog alone, sad
  protected renderDecline(ctx: CanvasRenderingContext2D, W: number, H: number) {
    drawAndysRoom(ctx, W, H);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, W, H);

    this.drawSprite(ctx, 'slinky', W / 2, H * 0.4, 200);

    ctx.fillStyle = '#3D2B1F';
    ctx.font = '700 16px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    const lines = [
      'So long, partner...',
      '',
      "We'll miss you",
      'at the party.',
      '',
      'Maybe next',
      'adventure!',
    ];
    lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.55 + i * 26));
  }

  // ---- TAP HANDLERS ----

  protected onTapTitle() {
    this.audio.click();
    this.goToIntro();
  }

  protected onTapIntro() {
    if (!this.introReady) {
      this.skipTypewriter();
    } else {
      this.audio.click();
      this.goToCalendar();
    }
  }

  protected onTapCalendar() {
    if (!this.calCircled) {
      this.audio.reveal();
      this.revealCalendar();
    } else if (this.calDialogue) {
      this.audio.click();
      this.goToMap();
    }
  }

  protected onTapMap() {
    if (!this.mapRevealed) {
      this.audio.reveal();
      this.revealMap();
    } else if (this.mapDialogue) {
      this.audio.click();
      this.goToGift();
    }
  }

  protected onTapGift(tapX: number, tapY: number) {
    if (!this.giftOpened) {
      this.audio.reveal();
      this.revealGift();
    } else if (this.giftDialogue) {
      const boxY = this.H - 140 - 16;
      const boxW = this.W - 32;
      const btnW = 160;
      const btnX = 16 + boxW - btnW - 12;
      const btnY = boxY + 8;
      if (tapX >= btnX && tapX <= btnX + btnW && tapY >= btnY && tapY <= btnY + 26) {
        this.openRegistry();
        return;
      }
      this.audio.click();
      this.goToRsvp();
    }
  }

  protected onTapConfirm(tapX: number, tapY: number) {
    const infoLines = 6;
    const btnY = this.H * 0.72 + infoLines * 16 + 10;
    if (tapY >= btnY && tapY <= btnY + 32 && tapX >= this.W / 2 - 100 && tapX <= this.W / 2 + 100) {
      this.audio.click();
      this.addToCalendar();
    }
  }
}
