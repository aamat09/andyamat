import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Fighter, BattleResult, MatchSummary, LeaderboardEntry, CharType, WeaponType,
} from './fighter/models/fighter.models';

export interface Invitation {
  id: string;
  guest_name: string;
  plus_ones: number;
  theme: string;
  created_at: string;
  view_count?: number;
  rsvp_name?: string;
  attending?: boolean;
  num_guests?: number;
  submitted_at?: string;
}

export interface RsvpPayload {
  invitation_id: string;
  name: string;
  num_guests: number;
  attending: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  getInvite(id: string): Observable<Invitation> {
    return this.http.get<Invitation>(`${this.base}/invites/${id}`);
  }

  recordView(id: string): Observable<any> {
    return this.http.post(`${this.base}/invites/${id}/view`, {});
  }

  submitRsvp(data: RsvpPayload): Observable<any> {
    return this.http.post(`${this.base}/rsvp`, data);
  }

  listInvites(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/admin/invites`);
  }

  updateRsvpEmail(invitationId: string, email: string): Observable<any> {
    return this.http.post(`${this.base}/rsvp/email`, {
      invitation_id: invitationId,
      guest_email: email,
    });
  }

  createInvite(guestName: string, plusOnes: number, theme: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/invites`, {
      guest_name: guestName,
      plus_ones: plusOnes,
      theme,
    });
  }

  updateInvite(id: string, guestName: string, plusOnes: number, theme: string): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.base}/invites/${id}`, {
      guest_name: guestName,
      plus_ones: plusOnes,
      theme,
    });
  }

  adminUpdateRsvp(id: string, data: { attending?: boolean; num_guests?: number }): Observable<any> {
    return this.http.put(`${this.base}/admin/invites/${id}/rsvp`, data);
  }

  deleteInvite(id: string): Observable<any> {
    return this.http.delete(`${this.base}/admin/invites/${id}`);
  }

  // ---- Pixel Arena ----

  createFighter(name: string, char_type: CharType, weapon: WeaponType): Observable<Fighter> {
    return this.http.post<Fighter>(`${this.base}/fighters`, { name, char_type, weapon });
  }

  getFighter(id: string): Observable<Fighter> {
    return this.http.get<Fighter>(`${this.base}/fighters/${id}`);
  }

  lookupFighter(name: string): Observable<Fighter> {
    return this.http.get<Fighter>(`${this.base}/fighters/lookup/${encodeURIComponent(name)}`);
  }

  searchFighters(q: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/fighters/search?q=${encodeURIComponent(q)}`);
  }

  battle(fighterId: string, opponentId?: string): Observable<BattleResult> {
    const body = opponentId ? { opponent_id: opponentId } : {};
    return this.http.post<BattleResult>(`${this.base}/fighters/${fighterId}/battle`, body);
  }

  getMatch(id: string): Observable<BattleResult> {
    return this.http.get<BattleResult>(`${this.base}/matches/${id}`);
  }

  getFighterMatches(id: string): Observable<MatchSummary[]> {
    return this.http.get<MatchSummary[]>(`${this.base}/fighters/${id}/matches`);
  }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.base}/leaderboard`);
  }
}
