import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, catchError, tap } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from '../token/token.service';
import { environment } from 'src/environments/environment';
import { UserProfile } from '../keycloack/user-profile';
import { UserInfo } from '../keycloack/user-info';
import { Wallet } from '../models/wallet';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse, AuthUser } from './auth.models';
import { WalletControllerService } from '../services/wallet-controller.service';
import { UserProfileImageControllerService } from '../services/user-profile-image-controller.service';
import { from, switchMap } from 'rxjs';

interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _profile: UserProfile | undefined;
  private _userInfo: UserInfo | undefined;
  private _currentUser: AuthUser | undefined;
  private fallbackImageUrl = 'assets/images/user-profile.png';

  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  private apiUrl = environment.apiUrl + '/api/v1';

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private walletService: WalletControllerService,
    private userProfileImageService: UserProfileImageControllerService,
    private sanitizer: DomSanitizer
  ) {}

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get token(): string | undefined {
    const t = this.tokenService.token;
    return t ? t : undefined;
  }

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  get userInfo(): UserInfo | undefined {
    return this._userInfo;
  }

  get currentUser(): AuthUser | undefined {
    return this._currentUser;
  }

  get roles(): string[] {
    return this._currentUser?.roles || [];
  }

  // ---------- Authentication ----------

  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const body: LoginRequest = { username, password };
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, body).pipe(
      tap(response => {
        if (response.success && response.data) {
          // If 2FA is required, don't store the token or set authenticated
          if (response.data.twoFactorRequired) {
            return;
          }
          if (response.data.accessToken) {
            this.tokenService.token = response.data.accessToken;
            this.decodeTokenAndSetUser(response.data.accessToken);
            this.setAuthenticated(true);
          }
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }

  requestPasswordReset(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/request-password-reset`, null, {
      params: { email }
    });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/reset-password`, null, {
      params: { token, newPassword }
    });
  }

  toggle2fa(enable: boolean): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/toggle-2fa`, null, {
      params: { enable: enable.toString() }
    });
  }

  verify2fa(username: string, code: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/verify-2fa`, null, {
      params: { username, code }
    }).pipe(
      tap(response => {
        if (response.success && response.data?.accessToken) {
          this.tokenService.token = response.data.accessToken;
          this.decodeTokenAndSetUser(response.data.accessToken);
          this.setAuthenticated(true);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, request);
  }

  logout(): void {
    this.tokenService.removeToken();
    this._isAuthenticated = false;
    this._profile = undefined;
    this._userInfo = undefined;
    this._currentUser = undefined;
    this.authStatusSubject.next(false);
    sessionStorage.removeItem('auth-authenticated');
    this.router.navigate(['/login']);
  }

  // ---------- App Initialization ----------

  async tryAutoLogin(): Promise<boolean> {
    const token = this.tokenService.token;
    if (!token) {
      this.setAuthenticated(false);
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        // Token expired
        this.tokenService.removeToken();
        this.setAuthenticated(false);
        return false;
      }

      this.decodeTokenAndSetUser(token);
      this.setAuthenticated(true);

      // Try loading full profile from backend
      try {
        await this.loadUserProfile();
      } catch (e) {
        // Profile load failed, but we have token claims as fallback
      }

      return true;
    } catch (e) {
      this.tokenService.removeToken();
      this.setAuthenticated(false);
      return false;
    }
  }

  async loadUserProfile(): Promise<void> {
    const token = this.tokenService.token;
    if (!token) return;

    try {
      const response = await this.http.get<ApiResponse<any>>(
        `${this.apiUrl}/auth/me`,
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      ).toPromise();

      if (response?.success && response.data) {
        const user = response.data;
        this._currentUser = {
          userId: user.userId,
          email: user.email,
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          roles: user.roles ? (typeof user.roles === 'string' ? user.roles.split(',').map((r: string) => r.trim()) : user.roles) : [],
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          twoFactorEnabled: user.twoFactorEnabled
        };

        // Update profile and userInfo for backward compatibility
        this._profile = {
          id: user.userId,
          username: user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phoneNumber,
          gender: user.gender,
          token: token
        };

        this._userInfo = {
          sub: user.userId,
          email: user.email,
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phoneNumber || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          address: {
            street_address: '',
            locality: '',
            region: '',
            postal_code: '',
            country: ''
          }
        };
      }
    } catch (e) {
      console.error('Failed to load user profile:', e);
    }
  }

  // ---------- Token Helpers ----------

  private decodeTokenAndSetUser(token: string): void {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      this._currentUser = {
        userId: decoded.userId || decoded.sub,
        email: decoded.email || decoded.sub,
        fullName: decoded.fullName || decoded.sub,
        firstName: decoded.fullName ? decoded.fullName.split(' ')[0] : '',
        lastName: decoded.fullName ? decoded.fullName.split(' ').slice(1).join(' ') : '',
        roles: decoded.roles || []
      };

      // Build backward-compatible profile and userInfo from JWT claims
      this._profile = {
        id: decoded.userId || decoded.sub,
        username: decoded.email || decoded.sub,
        email: decoded.email || decoded.sub,
        firstName: this._currentUser.firstName,
        lastName: this._currentUser.lastName,
        token: token
      };

      this._userInfo = {
        sub: decoded.userId || decoded.sub,
        email: decoded.email || decoded.sub,
        name: decoded.fullName || decoded.sub,
        firstName: this._currentUser.firstName,
        lastName: this._currentUser.lastName,
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
          street_address: '',
          locality: '',
          region: '',
          postal_code: '',
          country: ''
        }
      };
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
    }
  }

  isTokenValid(): boolean {
    const token = this.tokenService.token;
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      return decoded.exp > now + 30;
    } catch (e) {
      return false;
    }
  }

  private setAuthenticated(value: boolean): void {
    this._isAuthenticated = value;
    this.authStatusSubject.next(value);
    if (value) {
      sessionStorage.setItem('auth-authenticated', 'true');
    } else {
      sessionStorage.removeItem('auth-authenticated');
    }
  }

  // ---------- Role Checks ----------

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  // ---------- Wallet & Profile Image ----------

  fetchUserWallet(): Promise<Wallet | undefined> {
    return new Promise((resolve, reject) => {
      if (!this._isAuthenticated) {
        resolve(undefined);
        return;
      }

      this.walletService.getWalletByUser().pipe(
        catchError(err => {
          console.error('Error fetching wallet:', err);
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

  fetchUserProfileImage(defaultUrl: SafeUrl | string): Promise<SafeUrl> {
    return new Promise((resolve) => {
      if (!this._isAuthenticated) {
        resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
        return;
      }

      this.userProfileImageService.getUserProfileImageUrl().pipe(
        catchError(err => {
          return of({ data: null });
        })
      ).subscribe({
        next: (response: any) => {
          const imageUrl = response?.data;
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
            resolve(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
          } else {
            resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
          }
        },
        error: () => {
          resolve(this.sanitizer.bypassSecurityTrustUrl(defaultUrl as string));
        }
      });
    });
  }

  // ---------- Session Cleanup ----------

  clearSession(): void {
    this.setAuthenticated(false);
    this._profile = undefined;
    this._userInfo = undefined;
    this._currentUser = undefined;
  }
}
