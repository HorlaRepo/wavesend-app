import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { WithdrawalControllerService } from '../../../../services/services/withdrawal-controller.service';
import { KeycloakService } from '../../../../services/keycloack/keycloak.service';
import { OtpControllerService } from 'src/app/services/services';

@Component({
  selector: 'app-withdrawal-otp',
  templateUrl: './withdrawal-otp.component.html',
  styleUrls: ['./withdrawal-otp.component.css'],
  providers: [MessageService]
})
export class WithdrawalOtpComponent implements OnInit {
  email: string = '';
  withdrawalToken: string = '';
  isLoading: boolean = false;
  withdrawalDetails: any = {};
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private withdrawalService: WithdrawalControllerService,
    private keycloakService: KeycloakService,
    private otpService: OtpControllerService
  ) { }

  ngOnInit(): void {
    // Get email from Keycloak service
    this.email = this.keycloakService.userInfo?.email || '';
    
    // Get withdrawalToken from route or state
    this.route.paramMap.subscribe(params => {
      const state = window.history.state;
      
      if (state && state.withdrawalToken) {
        this.withdrawalToken = state.withdrawalToken;
        this.withdrawalDetails = {
          amount: state.amount,
          bankAccount: state.bankAccount,
          totalAmount: state.totalAmount
        };
      } else {
        // No token, redirect back to withdrawal page
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Withdrawal session expired or invalid. Please try again.'
        });
        this.router.navigate(['/account/withdraw']);
      }
    });
  }

  verifyOtp(otp: string): void {
    this.isLoading = true;
    
    this.withdrawalService.verifyAndWithdraw({
      body: {
        withdrawalToken: this.withdrawalToken,
        otp: otp
      }
    }).subscribe({
      next: response => {
        this.isLoading = false;
        this.router.navigate(['/account/withdraw-success'], {
          state: {
            withdrawalResponse: response,
            amount: this.withdrawalDetails.amount,
            bankAccount: this.withdrawalDetails.bankAccount,
            totalAmount: this.withdrawalDetails.totalAmount
          }
        });
      },
      error: err => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: err.error?.message || 'Invalid OTP code. Please try again.'
        });
      }
    });
  }

  resendOtp(): void {
    if (!this.withdrawalToken) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Transfer token is missing. Please try again.'
      });
      return;
    }
  
    this.messageService.add({
      severity: 'info',
      summary: 'Resending OTP',
      detail: 'Requesting a new verification code...'
    });
  
    this.otpService.resendOtp({
      body: {
        operationType: 'WITHDRAWAL', 
        transactionToken: this.withdrawalToken
      }
    }).subscribe({
      next: (response) => {
        console.log('OTP resent successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: 'A new verification code has been sent to your email.'
        });
      },
      error: (err) => {
        console.error('Failed to resend OTP:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to Resend',
          detail: err.error?.message || 'Could not resend verification code.'
        });
      }
    });
  }
}