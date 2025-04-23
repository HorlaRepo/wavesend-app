import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../keycloack/keycloak.service';

export const authGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  
  console.log('Auth guard checking authentication:', keycloakService.isAuthenticated);
  
  if (keycloakService.isAuthenticated) {
    // User is authenticated, allow access
    return true;
  }
  
  // Prevent redirection loops by checking if we're already on the login page
  // This is to prevent constant redirects if something goes wrong
  const currentUrl = state.url;
  console.log('Not authenticated, current URL:', currentUrl);
  
  if (currentUrl && (
      currentUrl.includes('auth') || 
      currentUrl.includes('callback') ||
      window.location.href.includes('code=')
    )) {
    console.log('Already in authentication flow, not redirecting again');
    return false;
  }
  
  // Force login if not authenticated
  console.log('Not authenticated, redirecting to login');
  keycloakService.login();
  return false;
};