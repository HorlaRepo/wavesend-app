import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from "../keycloack/keycloak.service";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  constructor(
    private keycloakService: KeycloakService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add token to API requests
    if (request.url.includes('api.wavesend.cc')) {
      const token = this.keycloakService.keycloak?.token;
      
      if (token) {
        console.log('Adding token to request:', request.url);
        
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Handle the request with error handling for 401s
        return next.handle(authRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            // If we get a 401, try to refresh the token
            if (error.status === 401) {
              console.log('Received 401, attempting to refresh token');
              
              return from(this.keycloakService.keycloak.updateToken(30)).pipe(
                switchMap(refreshed => {
                  if (refreshed) {
                    console.log('Token refreshed successfully, retrying request');
                    // Get the new token
                    const newToken = this.keycloakService.keycloak.token;
                    // Clone the original request with the new token
                    const newAuthRequest = request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`
                      }
                    });
                    // Retry the request with the new token
                    return next.handle(newAuthRequest);
                  } else {
                    console.log('Token still valid, retrying request');
                    // Token still valid, retry with same token
                    return next.handle(authRequest);
                  }
                }),
                catchError(refreshError => {
                  console.error('Failed to refresh token', refreshError);
                  // Force relogin on token refresh failure
                  this.keycloakService.login();
                  return throwError(() => error);
                })
              );
            }
            
            // For other errors, just forward them
            return throwError(() => error);
          })
        );
      } else {
        console.warn('No token available for API request:', request.url);
      }
    }
    
    // For non-API requests or when no token is available
    return next.handle(request);
  }
}