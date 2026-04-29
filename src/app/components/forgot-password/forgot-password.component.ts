import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  providers: [MessageService]
})
export class ForgotPasswordComponent {
  // Step 1: email, Step 2: OTP + new password, Step 3: success
  currentStep = 1;

  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onRequestReset(): void {
    if (!this.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter your email address'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.currentStep = 2;
          this.messageService.add({
            severity: 'success',
            summary: 'Code Sent',
            detail: 'A reset code has been sent to your email'
          });
        } else {
          this.errorMessage = response.message || 'Failed to send reset code';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.errorMessage
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send reset code. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.errorMessage
        });
      }
    });
  }

  onResetPassword(): void {
    if (!this.otpCode || !this.newPassword || !this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all fields'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Passwords do not match'
      });
      return;
    }

    if (this.newPassword.length < 8) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Password must be at least 8 characters long'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.otpCode, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.currentStep = 3;
        } else {
          this.errorMessage = response.message || 'Failed to reset password';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.errorMessage
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.errorMessage
        });
      }
    });
  }

  resendCode(): void {
    this.onRequestReset();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
