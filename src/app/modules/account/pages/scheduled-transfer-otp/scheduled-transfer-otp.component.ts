import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScheduledTransferControllerService } from '../../../../services/services/scheduled-transfer-controller.service';
import { KeycloakService } from '../../../../services/keycloack/keycloak.service';
import { DatePipe } from '@angular/common';
import { OtpControllerService } from 'src/app/services/services';

@Component({
  selector: 'app-scheduled-transfer-otp',
  templateUrl: './scheduled-transfer-otp.component.html',
  styleUrls: ['./scheduled-transfer-otp.component.css'],
  providers: [MessageService, DatePipe]
})
export class ScheduledTransferOtpComponent implements OnInit {
  email: string = '';
  scheduledTransferToken: string = '';
  isLoading: boolean = false;
  transferDetails: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private scheduledTransferService: ScheduledTransferControllerService,
    private keycloakService: KeycloakService,
    private datePipe: DatePipe,
    private otpService: OtpControllerService
  ) { }

  ngOnInit(): void {
    // Get email from Keycloak service
    this.email = this.keycloakService.userInfo?.email || '';

    // Get token from route or state
    this.route.paramMap.subscribe(params => {
      const state = window.history.state;

      if (state && state.scheduledTransferToken) {
        this.scheduledTransferToken = state.scheduledTransferToken;
        this.transferDetails = {
          amount: state.amount,
          recipientEmail: state.recipientEmail,
          recipientName: state.recipientName,
          scheduledDateTime: state.scheduledDateTime,
          recurrenceType: state.recurrenceType
        };
      } else {
        // No token, redirect back to schedule transfer page
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Scheduled transfer session expired or invalid. Please try again.'
        });
        this.router.navigate(['/account/schedule-transfer']);
      }
    });
  }

  verifyOtp(otp: string): void {
    this.isLoading = true;
    console.log('Verifying OTP for scheduled transfer');

    this.scheduledTransferService.verifyAndScheduleTransfer({
      body: {
        scheduledTransferToken: this.scheduledTransferToken,
        otp: otp
      }
    }).subscribe({
      next: response => {
        this.isLoading = false;
        console.log('Scheduled transfer verification response:', response);
        if (response && (response.success === true )) {
          // Navigate to success page with proper data structure
          this.router.navigate(['/account/schedule-success'], {
            state: {
              transferDetails: response,
              amount: this.transferDetails.amount,
              recipientName: this.transferDetails.recipientName,
              recipientEmail: this.transferDetails.recipientEmail,
              scheduledDateTime: this.transferDetails.scheduledDateTime,
              recurrenceType: this.transferDetails.recurrenceType
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
    if (!this.scheduledTransferToken) {
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
        operationType: 'SCHEDULED_TRANSFER', 
        transactionToken: this.scheduledTransferToken
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


  getFormattedDate(): string {
    if (!this.transferDetails.scheduledDateTime) return 'Unknown date';
    return this.datePipe.transform(this.transferDetails.scheduledDateTime, 'MMM d, y, h:mm a') || 'Unknown date';
  }
  

  getRecurrenceText(): string {
    if (!this.transferDetails.recurrenceType || this.transferDetails.recurrenceType === 'NONE') {
      return 'One-time transfer';
    }

    switch (this.transferDetails.recurrenceType) {
      case 'DAILY': return 'Daily transfer';
      case 'WEEKLY': return 'Weekly transfer';
      case 'BIWEEKLY': return 'Bi-weekly transfer';
      case 'MONTHLY': return 'Monthly transfer';
      default: return 'Recurring transfer';
    }
  }
}