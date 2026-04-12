import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invitation {
  id: string;
  guest_name: string;
  plus_ones: number;
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

  createInvite(guestName: string, plusOnes: number): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/invites`, {
      guest_name: guestName,
      plus_ones: plusOnes,
    });
  }
}
