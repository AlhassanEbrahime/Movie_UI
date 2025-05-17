// src/app/auth/auth.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MovieService } from '../services/movie.service';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface UserData {
  sub: string; 
  authorities: string; 
  exp: number; 
  iat: number; 
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private baseUrl = 'http://localhost:8080/api/v1/auth';
  private tokenRefreshIntervalId: any;
  
  userData = new BehaviorSubject<UserData | null>(null);
  isAuthenticated = new BehaviorSubject<boolean>(false);
  
  private subscription: Subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkToken();
    this.setupTokenRefresh();
  }

  ngOnDestroy(): void {
    if (this.tokenRefreshIntervalId) {
      clearInterval(this.tokenRefreshIntervalId);
    }
    this.subscription.unsubscribe();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          this.setTokens(response);
          this.isAuthenticated.next(true);
        })
      );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, email, password });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    
    this.userData.next(null);
    this.isAuthenticated.next(false);
    
    if (this.tokenRefreshIntervalId) {
      clearInterval(this.tokenRefreshIntervalId);
    }
    
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    const isLogged = !!token;
    this.isAuthenticated.next(isLogged);
    return isLogged;
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    
    const expiryDate = new Date(parseInt(expiry, 10));
    const now = new Date();
    
    return expiryDate <= now;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setTokens(response);
        })
      );
  }

  private setTokens(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    const decodedToken = jwtDecode<UserData>(response.access_token);
    this.userData.next(decodedToken);
    
    const expiry = new Date(decodedToken.exp * 1000);
    localStorage.setItem('token_expiry', expiry.getTime().toString());
  }

  private checkToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<UserData>(token);
        this.userData.next(decodedToken);
        this.isAuthenticated.next(true);
        
        if (this.isTokenExpired()) {
          this.subscription.add(
            this.refreshToken().subscribe({
              error: () => this.logout()
            })
          );
        }
      } catch (error) {
        this.logout();
      }
    } else {
      this.isAuthenticated.next(false);
    }
  }

  private setupTokenRefresh(): void {
    this.tokenRefreshIntervalId = setInterval(() => {
      if (this.isLoggedIn() && this.isTokenExpired()) {
        this.subscription.add(
          this.refreshToken().subscribe({
            error: () => this.logout()
          })
        );
      }
    }, 5 * 60 * 1000);
  }
}