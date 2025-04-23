import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { StepsProgressServiceService } from '../../../../services/steps-progress/steps-progress-service.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule-success',
  templateUrl: './schedule-success.component.html',
  styleUrls: ['./schedule-success.component.css'],
  providers: [DatePipe]
})
export class ScheduleSuccessComponent implements OnInit {
  transferDetails: any = null;
  amount: number = 0;
  recipientName: string = '';
  recipientEmail: string = '';
  scheduledDateTime: string = '';
  recurrenceType: string = '';
  currentStep: number = 3;
  errorMessage: string = '';
  
  constructor(
    public router: Router,
    private location: Location,
    private stepsProgressService: StepsProgressServiceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Initialize progress steps
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Verify', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
    
    // Get transfer details from state
    this.getTransferDetails();
  }

  getTransferDetails(): void {
    const state = window.history.state;
    console.log('Schedule success state:', state);
    
    if (state && state.transferDetails) {
      this.transferDetails = state.transferDetails;
      this.amount = state.amount || 0;
      this.recipientName = state.recipientName || '';
      this.recipientEmail = state.recipientEmail || '';
      this.scheduledDateTime = state.scheduledDateTime || '';
      this.recurrenceType = state.recurrenceType || 'NONE';
    } else {
      this.errorMessage = 'Transfer details not available';
      console.error('No transfer details found in state');
    }
  }
  
  getFormattedDate(): string {
    if (!this.scheduledDateTime) return 'Not specified';
    return this.datePipe.transform(this.scheduledDateTime, 'MMM d, y, h:mm a') || 'Invalid date';
  }
  
  getRecurrenceText(): string {
    if (!this.recurrenceType || this.recurrenceType === 'NONE') {
      return 'One-time transfer';
    }
    
    switch (this.recurrenceType) {
      case 'DAILY': return 'Daily transfer';
      case 'WEEKLY': return 'Weekly transfer';
      case 'BIWEEKLY': return 'Bi-weekly transfer';
      case 'MONTHLY': return 'Monthly transfer';
      default: return 'Recurring transfer';
    }
  }
  
  getRecurrenceBadgeClass(): string {
    if (!this.recurrenceType || this.recurrenceType === 'NONE') {
      return 'badge-one-time';
    }
    return 'badge-recurring';
  }
  
  getTransactionId(): string {
    return this.transferDetails?.data?.id || this.transferDetails?.data?.referenceNumber || 'Unknown';
  }

  goToDashboard(): void {
    this.router.navigate(['/account/dashboard']);
  }

  scheduleAnother(): void {
    this.router.navigate(['/account/schedule-transfer']);
  }
}