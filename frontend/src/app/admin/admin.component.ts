import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Invitation } from '../api.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  invites: Invitation[] = [];
  newName = '';
  newPlusOnes = 0;
  loading = false;
  error = '';
  baseUrl = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
  ) {}

  get currentUser(): string {
    return this.auth.username;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  ngOnInit() {
    this.baseUrl = window.location.origin;
    this.loadInvites();
  }

  loadInvites() {
    this.loading = true;
    this.api.listInvites().subscribe({
      next: (data) => {
        this.invites = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'API not available — Drogon backend not running';
        this.loading = false;
      },
    });
  }

  createInvite() {
    if (!this.newName.trim()) return;
    this.api.createInvite(this.newName.trim(), this.newPlusOnes).subscribe({
      next: (inv) => {
        this.invites.unshift(inv);
        this.newName = '';
        this.newPlusOnes = 0;
      },
      error: () => {
        this.error = 'Failed to create invite';
      },
    });
  }

  inviteUrl(id: string): string {
    return `${this.baseUrl}/invite/${id}`;
  }

  copyUrl(id: string) {
    navigator.clipboard.writeText(this.inviteUrl(id));
  }

  get totalAttending(): number {
    return this.invites
      .filter((i) => i.attending === true)
      .reduce((sum, i) => sum + (i.num_guests || 1), 0);
  }

  get totalDeclined(): number {
    return this.invites.filter((i) => i.attending === false).length;
  }

  get totalPending(): number {
    return this.invites.filter((i) => i.attending == null).length;
  }
}
