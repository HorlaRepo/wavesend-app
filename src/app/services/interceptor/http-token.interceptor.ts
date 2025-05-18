import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { KeycloakService } from "../keycloack/keycloak.service";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  private refreshing = false;

  constructor(
    private keycloakService: KeycloakService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add token to API requests
    if (request.url.includes('api.wavesend.cc') || request.url.includes('localhost:8080/api')) {
      const token = this.keycloakService.token;
      
      if (token) {
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Return the handled request with the token
        return next.handle(authRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            // Only try to refresh the token once at a time
            if (error.status === 401 && !this.refreshing) {
              this.refreshing = true;
              
              //console.log('Received 401, attempting to refresh token');
              
              return from(this.keycloakService.updateToken(60)).pipe(
                switchMap(refreshed => {
                  // Get the new token
                  const newToken = this.keycloakService.token;
                  
                  if (newToken) {
                    //console.log('Token refreshed, retrying request');
                    // Clone the original request with the new token
                    const newAuthRequest = request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`
                      }
                    });
                    
                    // Retry the request with the new token
                    return next.handle(newAuthRequest);
                  } else {
                    console.error('No token available after refresh');
                    return throwError(() => new Error('Authentication failed'));
                  }
                }),
                catchError(refreshError => {
                  console.error('Failed to refresh token', refreshError);
                  // Redirect to login if we can't refresh the token
                  this.keycloakService.login();
                  return throwError(() => refreshError);
                }),
                finalize(() => {
                  this.refreshing = false;
                })
              );
            }
            
            // For other errors, just forward them
            return throwError(() => error);
          })
        );
      } else {
        console.warn('No token available for API request:', request.url);
        
        // If no token is available, just pass the request through
        return next.handle(request);
      }
    }
    
    // For non-API requests, pass them through without modification
    return next.handle(request);
  }
}