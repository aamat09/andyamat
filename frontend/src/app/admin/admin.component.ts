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
  newTheme = 'toystory';
  loading = false;
  error = '';
  baseUrl = '';

  searchQuery = '';

  copiedId: string | null = null;

  editingId: string | null = null;
  editName = '';
  editPlusOnes = 0;
  editTheme = 'toystory';

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
    this.api.createInvite(this.newName.trim(), Number(this.newPlusOnes), this.newTheme).subscribe({
      next: (inv) => {
        this.invites.unshift(inv);
        this.newName = '';
        this.newPlusOnes = 0;
        this.newTheme = 'toystory';
      },
      error: () => {
        this.error = 'Failed to create invite';
      },
    });
  }

  get filteredInvites(): Invitation[] {
    if (!this.searchQuery.trim()) return this.invites;
    const q = this.searchQuery.toLowerCase();
    return this.invites.filter(inv =>
      inv.guest_name.toLowerCase().includes(q) ||
      inv.id.toLowerCase().includes(q) ||
      this.inviteUrl(inv).toLowerCase().includes(q)
    );
  }

  startEdit(inv: Invitation) {
    this.editingId = inv.id;
    this.editName = inv.guest_name;
    this.editPlusOnes = inv.plus_ones;
    this.editTheme = inv.theme || 'toystory';
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(inv: Invitation) {
    if (!this.editName.trim()) return;
    this.api.updateInvite(inv.id, this.editName.trim(), Number(this.editPlusOnes), this.editTheme).subscribe({
      next: (updated) => {
        inv.guest_name = updated.guest_name;
        inv.plus_ones = updated.plus_ones;
        inv.theme = updated.theme;
        this.editingId = null;
      },
      error: () => {
        this.error = 'Failed to update invite';
      },
    });
  }

  inviteUrl(inv: Invitation): string {
    const theme = inv.theme || 'toystory';
    return `${this.baseUrl}/${theme}/invite/${inv.id}`;
  }

  copyUrl(inv: Invitation) {
    navigator.clipboard.writeText(this.inviteUrl(inv));
    this.copiedId = inv.id;
    setTimeout(() => {
      if (this.copiedId === inv.id) this.copiedId = null;
    }, 2000);
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
