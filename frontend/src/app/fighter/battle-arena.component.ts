import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { BattleResult, BattleTurn, TurnAction, FighterSnapshot, CHAR_INFO } from './models/fighter.models';
import { drawCharacter, drawHealthBar, Pose } from './canvas/characters';
import { BattleAudio } from './audio/battle-audio';

interface DamageFloat {
  x: number; y: number; text: string; color: string; frame: number; maxFrame: number;
}

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-arena.component.html',
  styleUrl: './battle-arena.component.scss',
})
export class BattleArenaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('battleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  result: BattleResult | null = null;
  finished = false;
  error = '';
  CHAR_INFO = CHAR_INFO;

  private ctx!: CanvasRenderingContext2D;
  private W = 480;
  private H = 720;
  private frame = 0;
  private animId = 0;
  private audio = new BattleAudio();

  // Replay state
  private turnIndex = 0;
  private phase: 'effects' | 'action1' | 'action2' | 'pause' | 'done' = 'effects';
  private phaseFrame = 0;
  private readonly PHASE_DUR = 40;

  private f1Pose: Pose = 'idle';
  private f2Pose: Pose = 'idle';
  private f1Hp = 0;
  private f1MaxHp = 0;
  private f2Hp = 0;
  private f2MaxHp = 0;
  private f1TargetHp = 0;
  private f2TargetHp = 0;
  private floats: DamageFloat[] = [];

  // Slide offsets for attack animations
  private f1SlideX = 0;
  private f2SlideX = 0;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext('2d')!;

    this.route.params.subscribe(p => {
      this.api.getMatch(p['matchId']).subscribe({
        next: (r) => {
          this.result = r;
          this.f1Hp = r.fighter1.hp;
          this.f1MaxHp = r.fighter1.hp;
          this.f1TargetHp = r.fighter1.hp;
          this.f2Hp = r.fighter2.hp;
          this.f2MaxHp = r.fighter2.hp;
          this.f2TargetHp = r.fighter2.hp;
          this.zone.runOutsideAngular(() => this.loop());
        },
        error: () => this.error = 'Match not found',
      });
    });
  }

  ngOnDestroy() { cancelAnimationFrame(this.animId); }

  private loop() {
    this.frame++;
    this.phaseFrame++;
    this.advanceReplay();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private advanceReplay() {
    if (!this.result || this.finished) return;

    // Smooth HP interpolation
    this.f1Hp += (this.f1TargetHp - this.f1Hp) * 0.1;
    this.f2Hp += (this.f2TargetHp - this.f2Hp) * 0.1;

    // Slide back to neutral
    this.f1SlideX *= 0.9;
    this.f2SlideX *= 0.9;

    const log = this.result.battle_log;
    if (this.turnIndex >= log.length) {
      this.zone.run(() => this.finished = true);
      // Play victory/defeat sound
      const myId = localStorage.getItem('fighter_id');
      if (myId) {
        if (this.result!.winner_id === myId) this.audio.victory();
        else this.audio.defeat();
      } else {
        this.audio.victory();
      }
      return;
    }

    const turn = log[this.turnIndex];

    if (this.phaseFrame < this.PHASE_DUR) return;
    this.phaseFrame = 0;

    if (this.phase === 'effects') {
      // Apply status effects
      for (const eff of turn.effects) {
        if (eff.type === 'poison_tick' && eff.damage) {
          this.addFloat(eff.target, `-${eff.damage}`, '#2ECC71');
          this.audio.poison();
        }
      }
      this.phase = turn.actions.length > 0 ? 'action1' : 'pause';
    } else if (this.phase === 'action1') {
      this.playAction(turn, 0);
      this.phase = turn.actions.length > 1 ? 'action2' : 'pause';
    } else if (this.phase === 'action2') {
      this.playAction(turn, 1);
      this.phase = 'pause';
    } else if (this.phase === 'pause') {
      // Update HP from turn data
      const f1Id = this.result!.fighter1.id;
      const f2Id = this.result!.fighter2.id;
      this.f1TargetHp = Math.max(0, turn.hp_after[f1Id] ?? this.f1TargetHp);
      this.f2TargetHp = Math.max(0, turn.hp_after[f2Id] ?? this.f2TargetHp);

      this.f1Pose = this.f1TargetHp <= 0 ? 'dead' : 'idle';
      this.f2Pose = this.f2TargetHp <= 0 ? 'dead' : 'idle';

      this.turnIndex++;
      this.phase = 'effects';
    }
  }

  private playAction(turn: BattleTurn, idx: number) {
    if (!this.result) return;
    const action = turn.actions[idx];
    if (!action) return;

    const isF1 = action.actor === this.result.fighter1.id;

    if (action.type === 'stunned') {
      this.audio.stun();
      this.addFloat(action.actor, 'STUNNED', '#F39C12');
      return;
    }

    if (action.dodged) {
      this.audio.dodge();
      this.addFloat(action.actor === this.result.fighter1.id
        ? this.result.fighter2.id : this.result.fighter1.id, 'DODGE', '#7B68EE');
      return;
    }

    // Attacker slides forward
    if (isF1) { this.f1SlideX = 40; this.f1Pose = 'attack'; }
    else { this.f2SlideX = -40; this.f2Pose = 'attack'; }

    // Target hit
    const targetId = isF1 ? this.result.fighter2.id : this.result.fighter1.id;
    if (!isF1) this.f1Pose = 'hit'; else this.f2Pose = 'hit';

    if (action.type === 'skill') {
      this.audio.skill();
    } else {
      if (action.crit) this.audio.crit(); else this.audio.hit();
    }

    if (action.damage > 0) {
      const color = action.crit ? '#FFD700' : '#FFF';
      const prefix = action.crit ? 'CRIT ' : '';
      this.addFloat(targetId, `${prefix}-${action.damage}`, color);
    }

    if (action.skill) {
      const label = action.skill.replace(/_/g, ' ').toUpperCase();
      this.addFloat(action.actor, label, '#00D4FF');
    }

    if (action.stun) this.addFloat(targetId, 'STUNNED!', '#F39C12');
    if (action.poison) this.addFloat(targetId, 'POISONED!', '#2ECC71');
    if (action.absorb) this.addFloat(action.actor, `SHIELD +${action.absorb}`, '#00D4FF');
    if (action.def_buff) this.addFloat(action.actor, `DEF +${action.def_buff}`, '#4A90D9');
    if (action.self_damage) this.addFloat(action.actor, `-${action.self_damage}`, '#E74C3C');
  }

  private addFloat(targetId: string, text: string, color: string) {
    if (!this.result) return;
    const isF1 = targetId === this.result.fighter1.id;
    const baseX = isF1 ? 130 : 350;
    this.floats.push({
      x: baseX + (Math.random() - 0.5) * 30,
      y: 320,
      text, color,
      frame: 0, maxFrame: 50,
    });
  }

  private render() {
    if (!this.result) return;
    const { ctx, W, H } = this;

    // Arena background
    ctx.fillStyle = '#0D0D2B';
    ctx.fillRect(0, 0, W, H);

    // Floor
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(0, 460, W, H - 460);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.lineTo(W, 460);
    ctx.stroke();

    // VS text
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#444';
    ctx.fillText('VS', W / 2, 380);

    // Turn counter
    if (!this.finished) {
      ctx.font = '8px "Press Start 2P"';
      ctx.fillStyle = '#666';
      ctx.fillText(`TURN ${this.turnIndex + 1}`, W / 2, 40);
    }

    // Fighter names
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(this.result.fighter1.name.toUpperCase(), 130, 80);
    ctx.fillText(this.result.fighter2.name.toUpperCase(), 350, 80);

    // HP bars
    drawHealthBar(ctx, 40, 95, 180, 14, this.f1Hp, this.f1MaxHp, '#2ECC71');
    drawHealthBar(ctx, 260, 95, 180, 14, this.f2Hp, this.f2MaxHp, '#2ECC71');

    // HP text
    ctx.font = '7px "Press Start 2P"';
    ctx.fillStyle = '#AAA';
    ctx.fillText(`${Math.round(this.f1Hp)}/${this.f1MaxHp}`, 130, 124);
    ctx.fillText(`${Math.round(this.f2Hp)}/${this.f2MaxHp}`, 350, 124);

    // Draw fighters
    const f1x = 130 + this.f1SlideX;
    const f2x = 350 + this.f2SlideX;
    drawCharacter(ctx, this.result.fighter1.char_type, f1x, 370, 3, this.frame, this.f1Pose, 'right');
    drawCharacter(ctx, this.result.fighter2.char_type, f2x, 370, 3, this.frame, this.f2Pose, 'left');

    // Damage floats
    this.floats = this.floats.filter(f => {
      f.frame++;
      f.y -= 1.2;
      const alpha = 1 - f.frame / f.maxFrame;
      ctx.font = '10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
      return f.frame < f.maxFrame;
    });

    // Victory overlay
    if (this.finished) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 480, W, 240);

      ctx.font = '18px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';

      if (this.result.winner_id) {
        const winner = this.result.winner_id === this.result.fighter1.id
          ? this.result.fighter1 : this.result.fighter2;
        ctx.fillText(`${winner.name.toUpperCase()} WINS!`, W / 2, 530);
      } else {
        ctx.fillText('DRAW!', W / 2, 530);
      }

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#AAA';
      ctx.fillText(`ELO: ${this.result.elo_change > 0 ? '+' : ''}${this.result.elo_change}`, W / 2, 560);
    }
  }

  goProfile(name: string) { this.router.navigate(['/fighter', name]); }
  goHome() { this.router.navigate(['/home']); }
  watchAgain() {
    if (!this.result) return;
    // Reset replay
    this.finished = false;
    this.turnIndex = 0;
    this.phase = 'effects';
    this.phaseFrame = 0;
    this.f1Hp = this.result.fighter1.hp;
    this.f1TargetHp = this.result.fighter1.hp;
    this.f2Hp = this.result.fighter2.hp;
    this.f2TargetHp = this.result.fighter2.hp;
    this.f1Pose = 'idle';
    this.f2Pose = 'idle';
    this.floats = [];
  }
}
