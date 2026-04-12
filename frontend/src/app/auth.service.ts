import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = false;
  username = '';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<{ ok: boolean; username: string }>('/api/auth/login', {
        username,
        password,
      })
      .pipe(
        map((res) => {
          this.isLoggedIn = true;
          this.username = res.username;
          return true;
        }),
        catchError(() => of(false))
      );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      map(() => {
        this.isLoggedIn = false;
        this.username = '';
        return true;
      })
    );
  }

  checkAuth(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean; username: string }>('/api/auth/me')
      .pipe(
        map((res) => {
          this.isLoggedIn = res.authenticated;
          this.username = res.username || '';
          return res.authenticated;
        }),
        catchError(() => {
          this.isLoggedIn = false;
          return of(false);
        })
      );
  }
}
