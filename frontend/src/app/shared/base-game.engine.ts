import {
  Directive, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

export type Scene = 'title' | 'intro' | 'calendar' | 'map' | 'gift' | 'rsvp' | 'confirm' | 'decline';

@Directive()
export abstract class BaseGameEngine implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  protected ctx!: CanvasRenderingContext2D;
  protected W = 480;
  protected H = 720;
  protected frame = 0;
  private animId = 0;

  protected inviteId = '';
  protected guestName = '';

  scene: Scene = 'title';
  showRsvp = false;
  showEmailSignup = false;
  rsvpName = '';
  rsvpGuests = 0;
  rsvpAttending: boolean | null = null;
  guestEmail = '';

  // Scene-specific state shared across themes
  protected introText = '';
  protected introTyped = 0;
  protected introReady = false;
  protected calCircled = false;
  protected calDialogue = false;
  protected mapRevealed = false;
  protected mapDialogue = false;
  protected giftOpened = false;
  protected giftDialogue = false;

  protected route = inject(ActivatedRoute);
  protected api = inject(ApiService);
  protected zone = inject(NgZone);

  /** Subclass must return the intro typewriter target text. */
  protected abstract get introTarget(): string;

  /** Subclass must return the registry URL. */
  protected get registryUrl(): string {
    return 'https://www.amazon.com/baby-reg/sabrina-fonstecilla-june-2026-miami/3BIOJ51KE3ACA';
  }

  /** Subclass must return the Google Calendar event title. */
  protected get calendarTitle(): string {
    return "Andy's Baby Shower";
  }

  // ---- LIFECYCLE ----

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext('2d')!;

    this.route.paramMap.subscribe(params => {
      this.inviteId = params.get('id') || '';
      if (this.inviteId) {
        this.api.recordView(this.inviteId).subscribe({ error: () => {} });
        this.api.getInvite(this.inviteId).subscribe({
          next: inv => { this.guestName = inv.guest_name; },
          error: () => { this.guestName = 'Friend'; }
        });
      }
    });

    this.onInit();

    this.zone.runOutsideAngular(() => {
      this.loop();
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
  }

  /** Called after canvas is ready, before animation loop starts. Override for theme-specific init. */
  protected onInit() {}

  private loop() {
    this.frame++;
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  // ---- RENDERING (delegated to subclass) ----

  protected abstract renderTitle(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderIntro(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderCalendar(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderMap(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderGift(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderRsvp(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderConfirm(ctx: CanvasRenderingContext2D, W: number, H: number): void;
  protected abstract renderDecline(ctx: CanvasRenderingContext2D, W: number, H: number): void;

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

  // ---- INTRO TYPEWRITER ----

  protected tickTypewriter() {
    if (this.introTyped < this.introTarget.length) {
      this.introTyped++;
      this.introText = this.introTarget.slice(0, this.introTyped);
      if (this.introTyped === this.introTarget.length) {
        this.introReady = true;
      }
    }
  }

  protected skipTypewriter() {
    this.introTyped = this.introTarget.length;
    this.introText = this.introTarget;
    this.introReady = true;
  }

  // ---- TAP HANDLER ----

  onTap(event: Event) {
    event.preventDefault();

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

    this.handleTap(tapX, tapY);
  }

  /** Override in subclass for theme-specific tap areas. Default handles the standard scene flow. */
  protected handleTap(tapX: number, tapY: number) {
    switch (this.scene) {
      case 'title':
        this.onTapTitle(tapX, tapY);
        break;
      case 'intro':
        this.onTapIntro(tapX, tapY);
        break;
      case 'calendar':
        this.onTapCalendar(tapX, tapY);
        break;
      case 'map':
        this.onTapMap(tapX, tapY);
        break;
      case 'gift':
        this.onTapGift(tapX, tapY);
        break;
      case 'confirm':
        this.onTapConfirm(tapX, tapY);
        break;
    }
  }

  // Subclasses override these for theme-specific tap behavior (audio, hit areas)
  protected abstract onTapTitle(tapX: number, tapY: number): void;
  protected abstract onTapIntro(tapX: number, tapY: number): void;
  protected abstract onTapCalendar(tapX: number, tapY: number): void;
  protected abstract onTapMap(tapX: number, tapY: number): void;
  protected abstract onTapGift(tapX: number, tapY: number): void;
  protected abstract onTapConfirm(tapX: number, tapY: number): void;

  // ---- SCENE TRANSITIONS (shared) ----

  protected goToIntro() {
    this.scene = 'intro';
    this.introTyped = 0;
    this.introText = '';
    this.introReady = false;
  }

  protected goToCalendar() { this.scene = 'calendar'; }
  protected goToMap() { this.scene = 'map'; }
  protected goToGift() { this.scene = 'gift'; }

  protected goToRsvp() {
    this.zone.run(() => { this.showRsvp = true; });
    this.scene = 'rsvp';
  }

  protected revealCalendar() {
    this.calCircled = true;
    setTimeout(() => { this.calDialogue = true; }, 300);
  }

  protected revealMap() {
    this.mapRevealed = true;
    setTimeout(() => { this.mapDialogue = true; }, 300);
  }

  protected revealGift() {
    this.giftOpened = true;
    setTimeout(() => { this.giftDialogue = true; }, 300);
  }

  protected openRegistry() {
    window.open(this.registryUrl, '_blank');
  }

  // ---- RSVP LOGIC ----

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
      error: () => this.afterSubmit(),
    });
  }

  private afterSubmit() {
    this.showRsvp = false;
    if (this.rsvpAttending) {
      this.showEmailSignup = true;
    } else {
      this.scene = 'decline';
    }
  }

  submitEmail() {
    if (!this.guestEmail.trim()) return;
    this.api.updateRsvpEmail(this.inviteId, this.guestEmail.trim()).subscribe({
      error: () => {}
    });
    this.showEmailSignup = false;
    this.onEmailDone();
    this.scene = 'confirm';
  }

  skipEmail() {
    this.showEmailSignup = false;
    this.onEmailDone();
    this.scene = 'confirm';
  }

  /** Called when email step completes (submit or skip). Override for audio etc. */
  protected onEmailDone() {}

  protected addToCalendar() {
    const start = '20260502T143000';
    const end = '20260502T173000';
    const title = encodeURIComponent(this.calendarTitle);
    const location = encodeURIComponent("Emy's Place, 9101 SW 45th St, Miami, FL 33165");
    const details = encodeURIComponent(`Baby Andy's shower! Registry: ${this.registryUrl}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
    window.open(url, '_blank');
  }

  // ---- UTILS ----

  protected wrapText(text: string, maxW: number, font: string): string[] {
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
