import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environmentServer } from '../../environments/environment';
import { AppUser } from '../interfaces/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = environmentServer.SERVER_URL;

  private currentUser: AppUser | null = null;

  constructor(
    private http: HttpClient
  ) {}

  
  getMe(): Observable<AppUser> {
    if (this.currentUser) {
      return of(this.currentUser);
    }

    return this.http.get<AppUser>(
      `${this.API}/api/auth/me`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(user => {
        this.currentUser = user;
      })
    );
  }

  private getVisibleCookies(): string {
    return typeof document === 'undefined'
      ? '(server-side rendering)'
      : document.cookie || '(none visible to JavaScript)';
  }

  logout(): Observable<void> {

    return this.http.post<void>(
      `${this.API}/api/auth/logout`,
      {},
      {
        withCredentials: true
      }
    ).pipe(

      tap(() => {
        this.currentUser = null;
      })

    );
  }
}