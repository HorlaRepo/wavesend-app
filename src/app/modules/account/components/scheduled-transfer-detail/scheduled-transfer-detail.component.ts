import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScheduledTransferControllerService } from 'src/app/services/services/scheduled-transfer-controller.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ScheduledTransferRequestDto } from 'src/app/services/models/scheduled-transfer-request-dto';

@Component({
  selector: 'app-scheduled-transfer-detail',
  templateUrl: './scheduled-transfer-detail.component.html',
  styleUrls: ['./scheduled-transfer-detail.component.css'],
  providers: [MessageService]
})
export class ScheduledTransferDetailComponent implements OnInit {
  transferId!: number;
  transfer: any;
  isLoading = true;
  isEditing = false;
  
  // Form controls for editing
  editForm: FormGroup;
  dateControl = new FormControl('', [Validators.required]);
  timeControl = new FormControl('', [Validators.required]);
  recurringControl = new FormControl(false);
  frequencyControl = new FormControl('WEEKLY', [Validators.required]);
  endDateControl = new FormControl('');
  
  frequencies = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Every 2 Weeks', value: 'BIWEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' }
  ];
  
  minDate = new Date();
  minEndDate = new Date();
  isCancelling = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scheduledTransferService: ScheduledTransferControllerService,
    private messageService: MessageService
  ) {
    this.editForm = new FormGroup({
      date: this.dateControl,
      time: this.timeControl,
      recurring: this.recurringControl,
      frequency: this.frequencyControl,
      endDate: this.endDateControl
    });
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.transferId = Number(params.get('id'));
      this.fetchTransferDetails();
    });
    
    // Listen for recurring changes to enable/disable related fields
    this.recurringControl.valueChanges.subscribe(isRecurring => {
      if (isRecurring) {
        this.frequencyControl.enable();
        this.endDateControl.enable();
      } else {
        this.frequencyControl.disable();
        this.endDateControl.disable();
        this.endDateControl.setValue('');
      }
    });
    
    // Set minimum date to tomorrow
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
  }
  
  /**
   * Fetch transfer details
   */
  fetchTransferDetails(): void {
    this.isLoading = true;
    
    // For now we'll use getUserTransfers() and find the one we need
    // Ideally your API should provide a getTransferById endpoint
    this.scheduledTransferService.getUserTransfers().subscribe({
      next: (response) => {
        const transfer = response.data?.content?.find((t: any) => t.id === this.transferId);
        
        if (transfer) {
          this.transfer = transfer;
          this.populateForm();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Scheduled transfer not found'
          });
          setTimeout(() => {
            this.router.navigate(['/account/transactions'], { 
              queryParams: { tab: 'scheduled' } 
            });
          }, 1500);
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to load transfer details'
        });
        console.error('Error loading transfer details:', err);
      }
    });
  }
  
  /**
   * Populate form with transfer data
   */
  populateForm(): void {
    // Extract date and time from scheduledDate
    const scheduledDate = new Date(this.transfer.scheduledDate);
    this.dateControl.setValue(this.formatDate(scheduledDate));
    
    // Format time as HH:MM
    const hours = String(scheduledDate.getHours()).padStart(2, '0');
    const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
    this.timeControl.setValue(`${hours}:${minutes}`);
    
    // Set recurring and frequency
    this.recurringControl.setValue(!!this.transfer.frequency);
    
    if (this.transfer.frequency) {
      this.frequencyControl.setValue(this.transfer.frequency);
    }
    
    // Set end date if available
    if (this.transfer.endDate) {
      const endDate = new Date(this.transfer.endDate);
      this.endDateControl.setValue(this.formatDate(endDate));
    }
    
    // Initially disable editing
    this.disableForm();
  }
  
  /**
   * Format date for date input
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      this.enableForm();
    } else {
      this.disableForm();
    }
  }
  
  /**
   * Enable form fields for editing
   */
  enableForm(): void {
    this.dateControl.enable();
    this.timeControl.enable();
    this.recurringControl.enable();
    
    if (this.recurringControl.value) {
      this.frequencyControl.enable();
      this.endDateControl.enable();
    }
  }
  
  /**
   * Disable form fields
   */
  disableForm(): void {
    this.dateControl.disable();
    this.timeControl.disable();
    this.recurringControl.disable();
    this.frequencyControl.disable();
    this.endDateControl.disable();
  }
  
  /**
   * Update the scheduled transfer
   */
  updateTransfer(): void {
    if (!this.editForm.valid) {
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        control?.markAsTouched();
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fix the form errors before submitting'
      });
      return;
    }
    
    this.isLoading = true;
    
    // Combine date and time
    const scheduledDate = this.combineDateTime(
      this.dateControl.value!,
      this.timeControl.value!
    );
    
    // Prepare end date if recurring
    let endDate = null;
    if (this.recurringControl.value && this.endDateControl.value) {
      // Set end date to end of day
      endDate = new Date(this.endDateControl.value);
      endDate.setHours(23, 59, 59);
    }
    const formattedScheduledDate = this.formatToLocalDateTime(scheduledDate);
    const formattedEndDate = endDate ? this.formatToLocalDateTime(endDate) : undefined;
    
    const body: ScheduledTransferRequestDto = {
      amount: this.transfer.amount,
      description: this.transfer.narration || '',
      receiverEmail: this.transfer.recipientEmail,
      senderEmail: this.transfer.senderEmail || '',
      scheduledDateTime: formattedScheduledDate,
      recurrenceType: this.recurringControl.value ? 
        this.frequencyControl.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' : 
        'NONE',
      recurrenceEndDate: endDate ? formattedEndDate : undefined
    };
    
    this.scheduledTransferService.updateTransfer({ 
      id: this.transferId,
      body
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transfer updated successfully'
        });
        
        // Update local data and exit edit mode
        this.transfer = {
          ...this.transfer,
          scheduledDate: body.scheduledDateTime,
          frequency: body.recurrenceType !== 'NONE' ? body.recurrenceType : null,
          endDate: body.recurrenceEndDate
        };
        this.isEditing = false;
        this.disableForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to update transfer'
        });
        console.error('Error updating transfer:', err);
      }
    });
  }


  formatToLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Format without the 'T' separator, using space instead: YYYY-MM-DD hh:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Cancel the scheduled transfer
   */
  cancelTransfer(): void {
    if (confirm('Are you sure you want to cancel this scheduled transfer?')) {
      this.isCancelling = true;
      
      this.scheduledTransferService.cancelTransfer({ 
        id: this.transferId 
      }).subscribe({
        next: (response) => {
          this.isCancelling = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transfer cancelled successfully'
          });
          
          setTimeout(() => {
            this.router.navigate(['/account/transactions'], { 
              queryParams: { tab: 'scheduled' } 
            });
          }, 1500);
        },
        error: (err) => {
          this.isCancelling = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to cancel transfer'
          });
          console.error('Error cancelling transfer:', err);
        }
      });
    }
  }
  
  /**
   * Cancel recurring series
   */
  cancelRecurringSeries(): void {
    if (confirm('Are you sure you want to cancel all future transfers in this series?')) {
      this.isCancelling = true;
      
      // Assuming API provides a cancelRecurringSeries endpoint
      // You may need to adjust this based on your actual API
      this.scheduledTransferService.cancelRecurringSeries({ 
        parentId: this.transfer.seriesId
      }).subscribe({
        next: (response) => {
          this.isCancelling = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'All future transfers cancelled'
          });
          
          setTimeout(() => {
            this.router.navigate(['/account/transactions'], { 
              queryParams: { tab: 'scheduled' } 
            });
          }, 1500);
        },
        error: (err) => {
          this.isCancelling = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to cancel transfers'
          });
        }
      });
    }
  }
  
  /**
   * Combine date and time strings into a Date object
   */
  combineDateTime(dateStr: string, timeStr: string): Date {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  /**
   * Go back to transactions page
   */
  goBack(): void {
    this.router.navigate(['/account/transactions'], { 
      queryParams: { tab: 'scheduled' } 
    });
  }
  
  /**
   * Get human-readable frequency text
   */
  getFrequencyText(frequency: string): string {
    if (!frequency) return 'One-time';
    
    const frequencyMap: { [key: string]: string } = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'BIWEEKLY': 'Every 2 weeks',
      'MONTHLY': 'Monthly'
    };
    
    return frequencyMap[frequency] || frequency;
  }
  
  /**
   * Format status for display
   */
  formatStatus(status: string): string {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
}