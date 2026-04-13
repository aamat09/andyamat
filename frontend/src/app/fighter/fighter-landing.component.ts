import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { CharType, WeaponType, CHAR_INFO, WEAPON_INFO } from './models/fighter.models';
import { drawCharacter } from './canvas/characters';
import { BattleAudio } from './audio/battle-audio';

type Step = 'menu' | 'pick_class' | 'pick_weapon' | 'pick_name' | 'find';

@Component({
  selector: 'app-fighter-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fighter-landing.component.html',
  styleUrl: './fighter-landing.component.scss',
})
export class FighterLandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('arenaCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  step: Step = 'menu';
  selectedClass: CharType | null = null;
  selectedWeapon: WeaponType | null = null;
  fighterName = '';
  findName = '';
  searchResults: any[] = [];
  error = '';
  creating = false;

  readonly classes: CharType[] = ['knight', 'rogue', 'mage', 'berserker'];
  readonly weapons: WeaponType[] = ['iron_sword', 'war_hammer', 'shadow_dagger'];
  readonly CHAR_INFO = CHAR_INFO;
  readonly WEAPON_INFO = WEAPON_INFO;

  private ctx!: CanvasRenderingContext2D;
  private W = 480;
  private H = 720;
  private frame = 0;
  private animId = 0;
  private audio = new BattleAudio();

  constructor(private api: ApiService, private router: Router, private zone: NgZone) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext('2d')!;
    this.zone.runOutsideAngular(() => this.loop());
  }

  ngOnDestroy() { cancelAnimationFrame(this.animId); }

  private loop() {
    this.frame++;
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private render() {
    const { ctx, W, H } = this;
    // Dark background with subtle stars
    ctx.fillStyle = '#0D0D2B';
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 51) % W);
      const sy = ((i * 97 + 23) % H);
      const brightness = 0.3 + 0.7 * Math.sin(this.frame * 0.02 + i);
      ctx.globalAlpha = brightness;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.font = '28px "Press Start 2P"';
    ctx.textAlign = 'center';
    const titleBob = Math.sin(this.frame * 0.03) * 4;
    ctx.fillStyle = '#FFD700';
    ctx.fillText('PIXEL ARENA', W / 2, 80 + titleBob);
    ctx.font = '10px "Press Start 2P"';
    ctx.fillStyle = '#888';
    ctx.fillText('andyamat.com', W / 2, 105);

    // Animated characters parade
    if (this.step === 'menu') {
      const types: string[] = ['knight', 'rogue', 'mage', 'berserker'];
      types.forEach((t, i) => {
        const cx = 80 + i * 110;
        drawCharacter(ctx, t, cx, 260, 2, this.frame + i * 30, 'idle', 'right');
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = CHAR_INFO[t as CharType].color;
        ctx.fillText(CHAR_INFO[t as CharType].label.toUpperCase(), cx, 310);
      });
    }

    if (this.step === 'pick_class') {
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#FFF';
      ctx.fillText('CHOOSE YOUR CLASS', W / 2, 160);
      this.classes.forEach((t, i) => {
        const cx = 80 + i * 110;
        const selected = this.selectedClass === t;
        if (selected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - 30, 190, 60, 100);
        }
        drawCharacter(ctx, t, cx, 260, 2.2, this.frame + i * 30, 'idle', 'right');
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = selected ? '#FFD700' : CHAR_INFO[t].color;
        ctx.fillText(CHAR_INFO[t].label.toUpperCase(), cx, 310);
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = '#AAA';
        ctx.fillText(CHAR_INFO[t].desc, cx, 325);
      });
    }

    if (this.step === 'pick_weapon') {
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#FFF';
      ctx.fillText('CHOOSE YOUR WEAPON', W / 2, 160);

      // Show selected character
      if (this.selectedClass) {
        drawCharacter(ctx, this.selectedClass, W / 2, 250, 3, this.frame, 'idle', 'right');
      }
    }
  }

  onTap(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const scaleX = this.W / rect.width;
    const scaleY = this.H / rect.height;
    const tapX = (clientX - rect.left) * scaleX;
    const tapY = (clientY - rect.top) * scaleY;

    if (this.step === 'pick_class') {
      // Check which character was tapped
      this.classes.forEach((t, i) => {
        const cx = 80 + i * 110;
        if (tapX >= cx - 35 && tapX <= cx + 35 && tapY >= 190 && tapY <= 330) {
          this.audio.click();
          this.zone.run(() => {
            this.selectedClass = t;
            this.step = 'pick_weapon';
          });
        }
      });
    }
  }

  // DOM button handlers
  goCreate() { this.audio.click(); this.step = 'pick_class'; this.error = ''; }
  goFind()   { this.audio.click(); this.step = 'find'; this.error = ''; }
  goBack()   { this.audio.click(); this.step = 'menu'; this.error = ''; }
  goLeaderboard() { this.router.navigate(['/leaderboard']); }

  pickWeapon(w: WeaponType) {
    this.audio.click();
    this.selectedWeapon = w;
    this.step = 'pick_name';
  }

  submitCreate() {
    if (!this.fighterName.trim() || !this.selectedClass || !this.selectedWeapon) return;
    this.creating = true;
    this.error = '';
    this.api.createFighter(this.fighterName.trim(), this.selectedClass, this.selectedWeapon)
      .subscribe({
        next: (f) => {
          localStorage.setItem('fighter_id', f.id);
          localStorage.setItem('fighter_name', f.name);
          this.audio.victory();
          this.router.navigate(['/fighter', f.name]);
        },
        error: (err) => {
          this.creating = false;
          this.error = err.error?.error || 'Failed to create fighter';
        },
      });
  }

  onSearchInput() {
    const q = this.findName.trim();
    if (q.length < 1) { this.searchResults = []; return; }
    this.api.searchFighters(q).subscribe({
      next: (results) => this.searchResults = results,
      error: () => this.searchResults = [],
    });
  }

  selectFighter(name: string) {
    this.audio.click();
    this.router.navigate(['/fighter', name]);
  }

  submitFind() {
    if (!this.findName.trim()) return;
    this.error = '';
    if (this.searchResults.length === 1) {
      this.selectFighter(this.searchResults[0].name);
      return;
    }
    this.api.lookupFighter(this.findName.trim()).subscribe({
      next: (f) => this.router.navigate(['/fighter', f.name]),
      error: () => this.error = 'Fighter not found — try a partial name',
    });
  }
}
