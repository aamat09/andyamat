import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { LeaderboardEntry, CHAR_INFO, CharType } from './models/fighter.models';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnInit {
  entries: LeaderboardEntry[] = [];
  CHAR_INFO = CHAR_INFO;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getLeaderboard().subscribe(e => this.entries = e);
  }

  goFighter(name: string) { this.router.navigate(['/fighter', name]); }
  goHome() { this.router.navigate(['/home']); }

  typeColor(t: string): string {
    return CHAR_INFO[t as CharType]?.color ?? '#FFF';
  }
}
