import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  set token(token: string) {
    localStorage.setItem('token', token);
  }

  get token(): string {
    return localStorage.getItem('token') as string;
  }

  set refreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  get refreshToken(): string {
    return localStorage.getItem('refreshToken') as string;
  }

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getUserId(): number | null {
    const token = this.token;
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.userId;
    }
    return null;
  }
}
