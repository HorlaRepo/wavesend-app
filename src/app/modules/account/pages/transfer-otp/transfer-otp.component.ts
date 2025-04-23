import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MoneyTransferControllerService } from '../../../../services/services/money-transfer-controller.service';
import { KeycloakService } from '../../../../services/keycloack/keycloak.service';
import { OtpControllerService } from 'src/app/services/services';

@Component({
  selector: 'app-transfer-otp',
  templateUrl: './transfer-otp.component.html',
  styleUrls: ['./transfer-otp.component.css'],
  providers: [MessageService]
})
export class TransferOtpComponent implements OnInit {
  email: string = '';
  transferToken: string = '';
  isLoading: boolean = false;
  transferDetails: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private transferService: MoneyTransferControllerService,
    private keycloakService: KeycloakService,
    private otpService: OtpControllerService
  ) { }

  ngOnInit(): void {
    // Get email from Keycloak service
    this.email = this.keycloakService.userInfo?.email || '';

    // Get transferToken from route or state
    this.route.paramMap.subscribe(params => {
      const state = window.history.state;

      if (state && state.transferToken) {
        this.transferToken = state.transferToken;
        console.log('Transfer Token:', this.transferToken);
        console.log('Transfer Details:', state);
        this.transferDetails = {
          amount: state.amount,
          recipientEmail: state.recipientEmail,
          recipientName: state.recipientName
        };
      } else {
        // No token, redirect back to send money page
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Transfer session expired or invalid. Please try again.'
        });
        this.router.navigate(['/account/send-money']);
      }
    });
  }

  verifyOtp(otp: string): void {
    this.isLoading = true;

    this.transferService.verifyAndTransfer({
      body: {
        transferToken: this.transferToken,
        otp: otp
      }
    }).subscribe({
      next: response => {
        this.isLoading = false;
        if (response && response.success === true) {
          // Navigate to success page with proper data structure
          this.router.navigate(['/account/send-success'], {
            state: {
              paymentResponse: {
                status: 'success',
                message: response.message,
                data: response.data
              },
              amount: this.transferDetails.amount,
              recipientEmail: this.transferDetails.recipientEmail,
              recipientName: this.transferDetails.recipientName,
              transactionId: response.data?.referenceNumber
            }
          });
        } else {
          // Handle unexpected response format
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Unexpected response format. Please try again.'
          });
        }
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
    if (!this.transferToken) {
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
  
    // Use the otpService with the proper request model
    this.otpService.resendOtp({
      body: {
        operationType: 'TRANSFER',
        transactionToken: this.transferToken
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