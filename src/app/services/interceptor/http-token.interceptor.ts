import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add token to API requests
    if (request.url.includes('api.wavesend.cc') || request.url.includes('localhost:8080/api')) {
      const token = this.authService.token;

      if (token) {
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(authRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Token is invalid or expired, clear session and redirect to login
              this.authService.logout();
            }
            return throwError(() => error);
          })
        );
      } else {
        return next.handle(request);
      }
    }

    // For non-API requests, pass them through without modification
    return next.handle(request);
  }
}
