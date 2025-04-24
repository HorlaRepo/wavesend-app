import { UserProfile } from "./user-profile";
import Keycloak from "keycloak-js";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { UserInfo } from "./user-info";
import { Wallet } from "../models/wallet";
import { WalletControllerService } from "../services/wallet-controller.service";
import { UserProfileImageControllerService } from "../services/user-profile-image-controller.service";
import { BehaviorSubject, catchError, Observable, of, switchMap } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AppConfigService } from "../production/app-config.service";
import { EnvService } from '../production/env.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private readonly _keycloak: Keycloak;
  private _profile: UserProfile | undefined;
  private _userInfo: UserInfo | undefined;
  private _isAuthenticated: boolean = false;
  private fallbackImageUrl = 'assets/images/user-profile.png';
  
  // Add Subject for auth events
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private router: Router, 
    private walletService: WalletControllerService,
    private userProfileImageService: UserProfileImageControllerService,
    private sanitizer: DomSanitizer,
    private appConfigService: AppConfigService,
    private envService: EnvService
  ) {
    const keycloakUrl = environment.keycloak.url;
    const realm = environment.keycloak.realm;
    const clientId = environment.keycloak.clientId;

    console.log('Keycloak configuration:', { keycloakUrl, realm, clientId });

    this._keycloak = new Keycloak({
      url: keycloakUrl,
      realm: realm,
      clientId: clientId
    });
    
    // Check if we have a stored authentication state
    const storedAuth = sessionStorage.getItem('keycloak-authenticated');
    if (storedAuth === 'true') {
      this._isAuthenticated = true;
      this.authStatusSubject.next(true);
    }
  }

  // Add getters
  get keycloak() {
    return this._keycloak;
  }

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  get userInfo(): UserInfo | undefined {
    return this._userInfo;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  
  // Add token getter
  get token(): string | undefined {
    return this._keycloak?.token;
  }
  
  // Add roles getters
  get roles(): string[] {
    return this._keycloak?.realmAccess?.roles || [];
  }
  
  // Updated init method
  async init(): Promise<boolean> {
    try {
      console.log('Starting Keycloak init...');
      
      // Set token expired handler
      this._keycloak.onTokenExpired = () => {
        console.log('Token expired. Attempting refresh...');
        this.updateToken(30).then(refreshed => {
          console.log('Token refresh result:', refreshed ? 'successful' : 'not needed');
        });
      };
    
      const authenticated = await this._keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        enableLogging: true,
        pkceMethod: 'S256',
        responseMode: 'fragment',
        flow: 'standard',
        timeSkew: 30 // Add timeSkew to help with clock differences
      });
      
      console.log('Keycloak initialization result:', authenticated);

      // Clean up URL parameters after successful authentication
      if (authenticated && window.location.hash && window.location.hash.includes('state=')) {
        // Remove the hash fragment for cleaner URLs
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, cleanUrl);
      }
  
      if (authenticated) {
        // Update authentication state
        this.setAuthenticated(true);
        
        try {
          // Load user data
          this._profile = (await this._keycloak.loadUserProfile()) as UserProfile;
          this._userInfo = (await this._keycloak.loadUserInfo()) as UserInfo;
          this._profile.token = this._keycloak.token;
          
          // Setup token refresh
          this.setupTokenRefresh();
          return true;
        } catch (profileError) {
          console.error('Failed to load profile:', profileError);
          // Still return true as authentication succeeded
          return true;
        }
      } else {
        console.log('Not authenticated, will try login');
        this.setAuthenticated(false);
        // Instead of automatic login, let the application decide when to login
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
      this.setAuthenticated(false);
      return false;
    }
  }
  
  // Improved token refresh handling
  private setupTokenRefresh(): void {
    if (!this._keycloak?.tokenParsed) {
      console.warn('No token parsed data available, skipping token refresh setup');
      return;
    }
    
    // Set minimum validity to 70 seconds to ensure we refresh before expiry
    const minValidity = 70;
    
    // Keep track of refresh attempts to prevent loops
    let refreshAttempts = 0;
    const maxRefreshAttempts = 3;
    let refreshResetTimeout: any = null;
    
    this._keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      
      if (refreshAttempts >= maxRefreshAttempts) {
        console.warn('Maximum token refresh attempts reached, waiting before trying again');
        return;
      }
      
      refreshAttempts++;
      
      // Reset the counter after some time
      if (refreshResetTimeout) {
        clearTimeout(refreshResetTimeout);
      }
      refreshResetTimeout = setTimeout(() => {
        refreshAttempts = 0;
      }, 60000); // Reset after 1 minute
      
      this.updateToken(minValidity)
        .then(refreshed => {
          if (refreshed) {
            console.log('Token was successfully refreshed');
          } else {
            console.log('Token is still valid, no refresh needed');
          }
        })
        .catch(() => {
          console.log('Failed to refresh token, but not forcing login immediately');
        });
    };
    
    // Calculate when to refresh based on token expiry
    const expiresIn = (this._keycloak.tokenParsed as any).exp - Math.floor(Date.now() / 1000);
    console.log(`Token expires in ${expiresIn} seconds`);
    
    // Set a timer to refresh at 70% of token lifetime
    const refreshTime = expiresIn * 0.7 * 1000;
    setTimeout(() => {
      console.log('Scheduled token refresh triggered');
      this.updateToken();
    }, refreshTime);

    // Set up periodic token check every 2 minutes instead of every minute
    // to reduce the chance of causing refresh loops
    setInterval(() => {
      // Only attempt refresh if we're authenticated
      if (this._isAuthenticated) {
        this.updateToken(minValidity)
          .catch((error) => {
            console.log('Failed to refresh token during periodic check:', error);
          });
      }
    }, 120000); // 2 minutes
  }

  // New method for updating token
  updateToken(minValidity = 30): Promise<boolean> {
    if (!this._keycloak) {
      return Promise.resolve(false);
    }
    
    return this._keycloak.updateToken(minValidity)
      .then(refreshed => {
        if (refreshed) {
          console.log('Token was successfully refreshed');
        } else {
          console.log('Token is still valid, no refresh needed');
        }
        return refreshed;
      })
      .catch(error => {
        console.error('Failed to refresh token:', error);
        
        // If token refresh fails, check if user is still authenticated
        if (this.isTokenValid()) {
          return true; // Token is still valid
        } else {
          this.setAuthenticated(false);
          return false;
        }
      });
  }
  
  // New method to check if token is valid
  isTokenValid(): boolean {
    if (!this._keycloak || !this._keycloak.token) {
      return false;
    }
    
    try {
      // Get token expiry time
      const tokenParsed = this._keycloak.tokenParsed as any;
      if (!tokenParsed) return false;
      
      // exp is in seconds, current time is in milliseconds
      const expiresAt = tokenParsed.exp * 1000;
      const now = new Date().getTime();
      const timeLeft = expiresAt - now;
      
      // Return true if token is valid for at least 30 seconds
      return timeLeft > 30000;
    } catch (e) {
      console.error('Error checking token validity:', e);
      return false;
    }
  }
  
  // New method to update authentication status
  private setAuthenticated(value: boolean): void {
    this._isAuthenticated = value;
    this.authStatusSubject.next(value);
    
    if (value) {
      sessionStorage.setItem('keycloak-authenticated', 'true');
    } else {
      sessionStorage.removeItem('keycloak-authenticated');
    }
  }
  
  // Add role checking methods
  hasRole(role: string): boolean {
    return this._keycloak?.hasRealmRole(role) || false;
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this._keycloak?.hasResourceRole(role, resource) || false;
  }

  // Update login to have a simpler implementation
  async login(redirectUri?: string) {
    try {
      await this._keycloak.login({
        redirectUri: redirectUri || window.location.origin + '/account'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  // Update logout method
  logout(redirectUri?: string) {
    this.setAuthenticated(false);
    return this._keycloak.logout({
      redirectUri: redirectUri || window.location.origin
    });
  }

  // Improved wallet fetch method
  fetchUserWallet(): Promise<Wallet | undefined> {
    return new Promise((resolve, reject) => {
      if (!this._isAuthenticated) {
        console.warn('Attempting to fetch wallet while not authenticated');
        resolve(undefined);
        return;
      }
      
      this.walletService.getWalletByUser().pipe(
        catchError(err => {
          console.error('Error fetching wallet:', err);
          
          // Check if the error is due to authentication
          if (err.status === 401) {
            return from(this.updateToken()).pipe(
              switchMap(refreshed => {
                if (refreshed) {
                  // Retry after token refresh
                  return this.walletService.getWalletByUser();
                }
                return of(null);
              })
            );
          }
          
          return of(null);
        })
      ).subscribe({
        next: data => {
          resolve(data?.data);
        },
        error: err => {
          console.error('Error in wallet subscription:', err);
          reject(err);
        }
      });
    });
  }

  // Improved profile image fetch method
  fetchUserProfileImage(defaultUrl: SafeUrl | string): Promise<SafeUrl> {
    return new Promise((resolve) => {
      if (!this._isAuthenticated) {
        console.warn('Attempting to fetch profile image while not authenticated');
        resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
        return;
      }
      
      this.userProfileImageService.getUserProfileImageUrl().pipe(
        catchError(err => {
          console.error("Error fetching profile image:", err);
          
          // Try token refresh if it's an auth error
          if (err.status === 401) {
            return from(this.updateToken()).pipe(
              switchMap(refreshed => {
                if (refreshed) {
                  // Retry after token refresh
                  return this.userProfileImageService.getUserProfileImageUrl();
                }
                return of({ data: null });
              })
            );
          }
          
          return of({ data: null });
        })
      ).subscribe({
        next: (response: any) => {
          console.log("Received profile image response:", response);

          const imageUrl = response?.data;

          if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
            console.log("Using profile image URL:", imageUrl);
            resolve(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
          } else {
            console.log("Invalid or empty image URL in response, using default");
            resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
          }
        },
        error: (err) => {
          // Log the error and fall back to default image
          console.error("Error in profile image subscription:", err);
          resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
        }
      });
    });
  }
  
  // Add method to clear session data
  clearSession(): void {
    this.setAuthenticated(false);
    this._profile = undefined;
    this._userInfo = undefined;
  }
}










































// import { UserProfile } from "./user-profile";
// import Keycloak from "keycloak-js";
// import { Injectable } from "@angular/core";
// import { Router } from "@angular/router";
// import { UserInfo } from "./user-info";
// import { Wallet } from "../models/wallet";
// import { WalletControllerService } from "../services/wallet-controller.service";
// import { UserProfileImageControllerService } from "../services/user-profile-image-controller.service";
// import { catchError, Observable, of, switchMap } from "rxjs";
// import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
// import { map } from "rxjs/operators";
// import { environment } from "src/environments/environment";
// import { AppConfigService } from "../production/app-config.service";
// import { EnvService } from '../production/env.service';


// @Injectable({
//   providedIn: 'root'
// })
// export class KeycloakService {

//   private readonly _keycloak: Keycloak;
//   private _profile: UserProfile | undefined;
//   private _userInfo: UserInfo | undefined;
//   private _isAuthenticated: boolean = false;

//   private fallbackImageUrl = 'assets/images/user-profile.png';


//   get keycloak() {
//     return this._keycloak;
//   }

//   get profile(): UserProfile | undefined {
//     return this._profile;
//   }

//   get userInfo(): UserInfo | undefined {
//     return this._userInfo;
//   }

//   get isAuthenticated(): boolean {
//     return this._isAuthenticated;
//   }

//   constructor(private router: Router, private walletService: WalletControllerService,
//     private userProfileImageService: UserProfileImageControllerService,
//     private sanitizer: DomSanitizer,
//     private appConfigService: AppConfigService,
//     private envService: EnvService
//   ) {

//     const keycloakUrl = environment.keycloak.url;
//     const realm = environment.keycloak.realm;
//     const clientId = environment.keycloak.clientId;

//     console.log('Keycloak configuration:', { keycloakUrl, realm, clientId });


//     this._keycloak = new Keycloak({
//       url: keycloakUrl,
//       realm: realm,
//       clientId: clientId
//     });
//   }

//   // async init(): Promise<boolean> {
//   //   try {
//   //     console.log('Starting Keycloak init...');
      
//   //     // Add this line for debugging
//   //     this.keycloak.onTokenExpired = () => {
//   //       console.log('Token expired. Attempting refresh...');
//   //       this.keycloak.updateToken(30);
//   //     };
  
//   //     const authenticated = await this.keycloak.init({
//   //       onLoad: 'login-required',
//   //       checkLoginIframe: false, // Important to disable this
//   //       // silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
//   //       enableLogging: true,
//   //       pkceMethod: 'S256',
//   //       responseMode: 'fragment',
//   //       flow: 'standard'
//   //     });

//   //     if (authenticated) {
//   //       this._isAuthenticated = true;
//   //       this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
//   //       this._userInfo = (await this.keycloak.loadUserInfo()) as UserInfo;
//   //       this._profile.token = this.keycloak.token;
//   //       this.setupTokenRefresh();
//   //       return true;
//   //     } else {
//   //       this.keycloak.login({ redirectUri: window.location.origin + '/account' });
//   //       return false;
//   //     }
//   //   } catch (error) {
//   //     console.error('Failed to initialize Keycloak', error);
//   //     this.keycloak.login({ redirectUri: window.location.origin + '/account' });
//   //     return false;
//   //   }
//   // }



//   // Improved token refresh handling
  
  
//   async init(): Promise<boolean> {
//     try {
//       console.log('Starting Keycloak init...');
      
//       // Add this line for debugging
//       this.keycloak.onTokenExpired = () => {
//         console.log('Token expired. Attempting refresh...');
//         this.keycloak.updateToken(30);
//       };
    
//       const authenticated = await this.keycloak.init({
//         onLoad: 'check-sso', // Change to check-sso instead of login-required
//         checkLoginIframe: false, // Important to disable this
//         silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
//         enableLogging: true,
//         pkceMethod: 'S256',
//         responseMode: 'fragment',
//         flow: 'standard'
//       });
  
//       if (authenticated) {
//         this._isAuthenticated = true;
//         try {
//           this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
//           this._userInfo = (await this.keycloak.loadUserInfo()) as UserInfo;
//           this._profile.token = this.keycloak.token;
//           this.setupTokenRefresh();
//           return true;
//         } catch (profileError) {
//           console.error('Failed to load profile:', profileError);
//           // Still return true as authentication succeeded
//           return true;
//         }
//       } else {
//         console.log('Not authenticated, will try login');
//         // Instead of automatic login, let the application decide when to login
//         return false;
//       }
//     } catch (error) {
//       console.error('Failed to initialize Keycloak', error);
//       return false;
//     }
//   }
  
  
  
  
//   // Improved token refresh handling
// private setupTokenRefresh(): void {
//   // Set minimum validity to 70 seconds to ensure we refresh before expiry
//   const minValidity = 70;
  
//   // Keep track of refresh attempts to prevent loops
//   let refreshAttempts = 0;
//   const maxRefreshAttempts = 3;
//   let refreshResetTimeout: any = null;
  
//   this.keycloak.onTokenExpired = () => {
//     console.log('Token expired, refreshing...');
    
//     if (refreshAttempts >= maxRefreshAttempts) {
//       console.warn('Maximum token refresh attempts reached, waiting before trying again');
//       return;
//     }
    
//     refreshAttempts++;
    
//     // Reset the counter after some time
//     if (refreshResetTimeout) {
//       clearTimeout(refreshResetTimeout);
//     }
//     refreshResetTimeout = setTimeout(() => {
//       refreshAttempts = 0;
//     }, 60000); // Reset after 1 minute
    
//     this.keycloak.updateToken(minValidity)
//       .then(refreshed => {
//         if (refreshed) {
//           console.log('Token was successfully refreshed');
//         } else {
//           console.log('Token is still valid, no refresh needed');
//         }
//       })
//       .catch(() => {
//         console.log('Failed to refresh token, but not forcing login immediately');
//       });
//   };

//   // Set up periodic token check every 2 minutes instead of every minute
//   // to reduce the chance of causing refresh loops
//   setInterval(() => {
//     // Only attempt refresh if we're authenticated
//     if (this._isAuthenticated) {
//       this.keycloak.updateToken(minValidity)
//         .catch((error) => {
//           console.log('Failed to refresh token during periodic check:', error);
//         });
//     }
//   }, 120000); // 2 minutes
// }


//   // Update login to have a simpler implementation
//   async login() {
//     try {
//       await this.keycloak.login({
//         redirectUri: window.location.origin + '/account'
//       });
//     } catch (error) {
//       console.error('Login failed:', error);
//     }
//   }

//   // Update logout to redirect to login which will immediately prompt for authentication
//   logout() {
//     return this.keycloak.logout({
//       redirectUri: window.location.origin
//     });
//   }

//   fetchUserWallet(): Promise<Wallet | undefined> {
//     return new Promise((resolve, reject) => {
//       this.walletService.getWalletByUser().subscribe({
//         next: data => {
//           resolve(data.data);
//         },
//         error: err => {
//           console.error(err);
//           reject(err);
//         }
//       })
//     });
//   }

//   fetchUserProfileImage(defaultUrl: SafeUrl | string): Promise<SafeUrl> {
//     return new Promise((resolve) => {
//       this.userProfileImageService.getUserProfileImageUrl().subscribe({
//         next: (response: any) => {

//           console.log("Received profile image response:", response);

//           const imageUrl = response?.data;

//           if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
//             console.log("Using profile image URL:", imageUrl);
//             resolve(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
//           } else {
//             console.log("Invalid or empty image URL in response, using default");
//             resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
//           }
//         },
//         error: (err) => {
//           // Log the error and fall back to default image
//           console.error("Error fetching profile image:", err);
//           resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
//         }
//       });
//     });
//   }
// }
