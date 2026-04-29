import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  // 2FA state
  twoFactorRequired = false;
  twoFactorUsername = '';
  twoFactorCode = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // If already authenticated, redirect to account
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/account']);
    }
  }

  login(): void {
    if (!this.username || !this.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Email and password are required'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: async (response) => {
        if (response.success) {
          // Check if 2FA is required
          if (response.data?.twoFactorRequired) {
            this.isLoading = false;
            this.twoFactorRequired = true;
            this.twoFactorUsername = this.username;
            this.messageService.add({
              severity: 'info',
              summary: 'Two-Factor Authentication',
              detail: 'A verification code has been sent to your email'
            });
            return;
          }

          // No 2FA - proceed normally
          try {
            await this.authService.loadUserProfile();
          } catch (e) {
            // Profile load failed, continue with JWT claims
          }
          this.isLoading = false;
          this.router.navigate(['/account']);
        } else {
          this.isLoading = false;
          this.errorMessage = response.message || 'Login failed';
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: this.errorMessage
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: this.errorMessage
        });
      }
    });
  }

  verify2fa(): void {
    if (!this.twoFactorCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter the verification code'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verify2fa(this.twoFactorUsername, this.twoFactorCode).subscribe({
      next: async (response) => {
        if (response.success && response.data?.accessToken) {
          try {
            await this.authService.loadUserProfile();
          } catch (e) {
            // Profile load failed, continue with JWT claims
          }
          this.isLoading = false;
          this.router.navigate(['/account']);
        } else {
          this.isLoading = false;
          this.errorMessage = response.message || 'Verification failed';
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: this.errorMessage
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid verification code';
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: this.errorMessage
        });
      }
    });
  }

  resendCode(): void {
    this.isLoading = true;
    // Re-login to trigger a new code to be sent
    this.authService.login(this.twoFactorUsername, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Code Sent',
            detail: 'A new verification code has been sent to your email'
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resend code. Please try again.'
        });
      }
    });
  }

  backToLogin(): void {
    this.twoFactorRequired = false;
    this.twoFactorCode = '';
    this.twoFactorUsername = '';
    this.errorMessage = '';
  }
}
