import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../api.service';
import { Fighter, MatchSummary, CHAR_INFO } from './models/fighter.models';
import { drawCharacter } from './canvas/characters';
import { BattleAudio } from './audio/battle-audio';

@Component({
  selector: 'app-fighter-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fighter-profile.component.html',
  styleUrl: './fighter-profile.component.scss',
})
export class FighterProfileComponent implements AfterViewInit, OnDestroy {
  @ViewChild('profileCanvas') set canvasRef(ref: ElementRef<HTMLCanvasElement>) {
    if (ref && !this.ctx) {
      const canvas = ref.nativeElement;
      canvas.width = this.W;
      canvas.height = this.H;
      this.ctx = canvas.getContext('2d')!;
      this.zone.runOutsideAngular(() => this.loop());
    }
  }

  fighter: Fighter | null = null;
  matches: MatchSummary[] = [];
  isOwner = false;
  battling = false;
  error = '';
  CHAR_INFO = CHAR_INFO;

  private ctx: CanvasRenderingContext2D | null = null;
  private W = 480;
  private H = 300;
  private frame = 0;
  private animId = 0;
  private audio = new BattleAudio();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.route.params.subscribe(p => {
      this.api.lookupFighter(p['name']).subscribe({
        next: (f) => {
          this.fighter = f;
          this.isOwner = localStorage.getItem('fighter_id') === f.id;
          this.api.getFighterMatches(f.id).subscribe(m => this.matches = m);
        },
        error: () => this.error = 'Fighter not found',
      });
    });
  }

  ngOnDestroy() { cancelAnimationFrame(this.animId); }

  private loop() {
    this.frame++;
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private render() {
    if (!this.fighter || !this.ctx) return;
    const ctx = this.ctx;
    const { W, H } = this;

    ctx.fillStyle = '#0D0D2B';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 137 + 51) % W);
      const sy = ((i * 97 + 23) % H);
      ctx.globalAlpha = 0.3 + 0.7 * Math.sin(this.frame * 0.02 + i);
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    drawCharacter(ctx, this.fighter.char_type, W / 2, H / 2 + 20, 3.5, this.frame, 'idle', 'right');

    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(this.fighter.name.toUpperCase(), W / 2, 36);

    ctx.font = '10px "Press Start 2P"';
    ctx.fillStyle = CHAR_INFO[this.fighter.char_type].color;
    ctx.fillText(`LV.${this.fighter.level} ${CHAR_INFO[this.fighter.char_type].label.toUpperCase()}`, W / 2, 56);
  }

  startBattle() {
    if (!this.fighter || this.battling) return;
    this.battling = true;
    this.audio.click();
    this.api.battle(this.fighter.id).subscribe({
      next: (result) => {
        this.router.navigate(['/battle', result.match_id]);
      },
      error: (err) => {
        this.battling = false;
        this.error = err.error?.error || 'Battle failed';
      },
    });
  }

  getMatchResult(m: MatchSummary): string {
    if (!this.fighter) return '';
    if (!m.winner_id) return 'DRAW';
    return m.winner_id === this.fighter.id ? 'WIN' : 'LOSS';
  }

  getOpponentName(m: MatchSummary): string {
    if (!this.fighter) return '';
    return m.fighter1_id === this.fighter.id ? m.f2_name : m.f1_name;
  }

  goHome() { this.router.navigate(['/home']); }
}
