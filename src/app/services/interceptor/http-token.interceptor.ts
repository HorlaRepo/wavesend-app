import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../token/token.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  private apiUrl = environment.apiUrl;
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(this.apiUrl)) {
      return next.handle(request);
    }

    const token = this.authService.token;
    const authRequest = token ? this.addToken(request, token) : request;

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/refresh-token')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.refreshToken;
      if (!refreshToken) {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }

      return this.authService.refreshAccessToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          if (response.success && response.data?.accessToken) {
            this.refreshTokenSubject.next(response.data.accessToken);
            return next.handle(this.addToken(request, response.data.accessToken));
          }
          this.authService.logout();
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    // If already refreshing, wait for new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token!)))
    );
  }
}
