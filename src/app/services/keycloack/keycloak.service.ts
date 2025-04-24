import { UserProfile } from "./user-profile";
import Keycloak from "keycloak-js";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { UserInfo } from "./user-info";
import { Wallet } from "../models/wallet";
import { WalletControllerService } from "../services/wallet-controller.service";
import { UserProfileImageControllerService } from "../services/user-profile-image-controller.service";
import { catchError, Observable, of, switchMap } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AppConfigService } from "../production/app-config.service";
import { EnvService } from '../production/env.service';


@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private readonly _keycloak: Keycloak;
  private _profile: UserProfile | undefined;
  private _userInfo: UserInfo | undefined;
  private _isAuthenticated: boolean = false;

  private fallbackImageUrl = 'assets/images/user-profile.png';


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

  constructor(private router: Router, private walletService: WalletControllerService,
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
  }

  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        enableLogging: true,
        pkceMethod: 'S256',
        // Add these settings to fix cookie issues
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        flow: 'standard',  // Use standard flow instead of implicit
        responseMode: 'fragment'
      });

      if (authenticated) {
        this._isAuthenticated = true;
        this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
        this._userInfo = (await this.keycloak.loadUserInfo()) as UserInfo;
        this._profile.token = this.keycloak.token;
        this.setupTokenRefresh();
        return true;
      } else {
        this.keycloak.login({ redirectUri: window.location.origin + '/account' });
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
      this.keycloak.login({ redirectUri: window.location.origin + '/account' });
      return false;
    }
  }



  // Improved token refresh handling
  private setupTokenRefresh(): void {
    // Set minimum validity to 70 seconds to ensure we refresh before expiry
    const minValidity = 70;

    this.keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      this.keycloak.updateToken(minValidity)
        .then(refreshed => {
          if (refreshed) {
            console.log('Token was successfully refreshed');
          } else {
            console.log('Token is still valid, no refresh needed');
          }
        })
        .catch(() => {
          console.log('Failed to refresh token, logging out');
          // Add a small delay before logging out to prevent UI glitches
          setTimeout(() => this.keycloak.login(), 100);
        });
    };

    // Set up periodic token check every 60 seconds
    setInterval(() => {
      this.keycloak.updateToken(minValidity)
        .catch(() => {
          console.log('Failed to refresh token during periodic check');
        });
    }, 60000);
  }

  // Update login to have a simpler implementation
  async login() {
    try {
      await this.keycloak.login({
        redirectUri: window.location.origin + '/account'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  // Update logout to redirect to login which will immediately prompt for authentication
  logout() {
    return this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  fetchUserWallet(): Promise<Wallet | undefined> {
    return new Promise((resolve, reject) => {
      this.walletService.getWalletByUser().subscribe({
        next: data => {
          resolve(data.data);
        },
        error: err => {
          console.error(err);
          reject(err);
        }
      })
    });
  }

  fetchUserProfileImage(defaultUrl: SafeUrl | string): Promise<SafeUrl> {
    return new Promise((resolve) => {
      this.userProfileImageService.getUserProfileImageUrl().subscribe({
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
          console.error("Error fetching profile image:", err);
          resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
        }
      });
    });
  }
}
