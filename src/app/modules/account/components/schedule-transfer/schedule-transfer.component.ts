import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScheduledTransferControllerService } from 'src/app/services/services/scheduled-transfer-controller.service';
import { KeycloakService } from 'src/app/services/keycloack/keycloak.service';
import { UserInfo } from 'src/app/services/keycloack/user-info';
import { Wallet } from 'src/app/services/models/wallet';
import { KeycloakEventsControllerService } from 'src/app/services/services/keycloak-events-controller.service';
import { debounceTime } from 'rxjs/operators';
import { InputParserService } from 'src/app/services/input-parser/input-parser.service';
import { ScheduledTransferRequestDto, UserRepresentation } from 'src/app/services/models';

@Component({
  selector: 'app-schedule-transfer',
  templateUrl: './schedule-transfer.component.html',
  styleUrls: ['./schedule-transfer.component.css'],
  providers: [MessageService]
})
export class ScheduleTransferComponent implements OnInit {
  // Form controls
  scheduleTransferForm: FormGroup;
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  amountControl = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  narrationControl = new FormControl('', [Validators.required]);
  dateControl = new FormControl('', [Validators.required]);
  timeControl = new FormControl('', [Validators.required]);
  recurringControl = new FormControl(false);
  frequencyControl = new FormControl('WEEKLY', [Validators.required]);
  endDateControl = new FormControl('');

  // Other properties
  isLoading = false;
  isUserFound = false;
  errorMessage = '';
  recipient: UserRepresentation | undefined;
  user: UserInfo | undefined;
  wallet: Wallet | undefined;

  frequencies = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Every 2 Weeks', value: 'BIWEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' }
  ];

  minDate = new Date();
  minEndDate = new Date();

  constructor(
    private scheduledTransferService: ScheduledTransferControllerService,
    private router: Router,
    private messageService: MessageService,
    private keycloakService: KeycloakService,
    private keycloakEventsService: KeycloakEventsControllerService,
    private inputParserService: InputParserService
  ) {
    this.scheduleTransferForm = new FormGroup({
      email: this.emailControl,
      amount: this.amountControl,
      narration: this.narrationControl,
      date: this.dateControl,
      time: this.timeControl,
      recurring: this.recurringControl,
      frequency: this.frequencyControl,
      endDate: this.endDateControl
    });
  }

  async ngOnInit(): Promise<void> {
    this.user = this.keycloakService.userInfo;
    this.wallet = await this.keycloakService.fetchUserWallet();

    this.minDate = new Date();

    // Set default date to today
    const today = new Date();
    this.dateControl.setValue(this.formatDate(today));

    // Set default time to current time + 15 minutes
    const defaultTime = this.getTimeWithMinimumBuffer();
    this.timeControl.setValue(defaultTime);

    // Add validators for time when date is today
    this.dateControl.valueChanges.subscribe(date => {
      this.validateTimeBasedOnSelectedDate();
    });

    this.timeControl.valueChanges.subscribe(() => {
      this.validateTimeBasedOnSelectedDate();
    });

    // Initial validation
    this.validateTimeBasedOnSelectedDate();
    // Calculate minimum end date based on frequency
    this.updateMinEndDate();

    // Listen for email changes to validate recipient
    this.emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(value => {
      if (value && this.emailControl.valid) {
        this.fetchUserByEmail(value);
      } else {
        this.isUserFound = false;
        this.recipient = undefined;
      }
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

    // Listen for frequency changes to update minimum end date
    this.frequencyControl.valueChanges.subscribe(() => {
      this.updateMinEndDate();
    });

    // Initialize recurring fields as disabled by default
    this.frequencyControl.disable();
    this.endDateControl.disable();
  }

  /**
   * Format date for the date input
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
 * Validate the time based on the selected date
 * If today is selected, time must be at least 15 minutes from now
 */
  validateTimeBasedOnSelectedDate(): void {
    // Skip validation if no date selected yet
    if (!this.dateControl.value) {
      return;
    }
    const selectedDate = new Date(this.dateControl.value);
    const today = new Date();

    // Only apply special time validation if the selected date is today
    if (this.isSameDay(selectedDate, today)) {
      const selectedTime = this.timeControl.value;

      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);

        // Create date objects for comparison
        const selectedDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

        // Minimum time is current time + 15 minutes
        const minDateTime = new Date();
        minDateTime.setMinutes(minDateTime.getMinutes() + 15);

        // Check if selected time is earlier than minimum allowed time
        if (selectedDateTime < minDateTime) {
          this.timeControl.setErrors({ 'minTime': true });
        } else {
          // Clear minTime error if time is valid now
          const currentErrors = this.timeControl.errors;
          if (currentErrors) {
            const { minTime, ...otherErrors } = currentErrors;

            // Only set other errors (if any)
            if (Object.keys(otherErrors).length > 0) {
              this.timeControl.setErrors(otherErrors);
            } else {
              this.timeControl.setErrors(null);
            }
          }
        }
      }
    } else {
      // If not today, clear the minTime error if it exists
      const currentErrors = this.timeControl.errors;
      if (currentErrors) {
        const { minTime, ...otherErrors } = currentErrors;

        // Only set other errors (if any)
        if (Object.keys(otherErrors).length > 0) {
          this.timeControl.setErrors(otherErrors);
        } else {
          this.timeControl.setErrors(null);
        }
      }
    }
  }


  /**
   * Get the current time plus 15 minutes, formatted as HH:MM
   */
  getTimeWithMinimumBuffer(): string {
    const now = new Date();

    // Add 15 minutes to current time
    now.setMinutes(now.getMinutes() + 15);

    // Round to nearest 5 minutes for better UX
    const minutes = Math.ceil(now.getMinutes() / 5) * 5;
    now.setMinutes(minutes);

    // Format as HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');

    return `${hours}:${mins}`;
  }

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }



  /**
   * Update minimum end date based on frequency
   */
  updateMinEndDate(): void {
    const scheduledDate = this.dateControl.value ? new Date(this.dateControl.value) : new Date();
    this.minEndDate = new Date(scheduledDate);

    // Add appropriate days based on frequency
    switch (this.frequencyControl.value) {
      case 'DAILY':
        this.minEndDate.setDate(scheduledDate.getDate() + 2); // At least 2 days for daily
        break;
      case 'WEEKLY':
        this.minEndDate.setDate(scheduledDate.getDate() + 14); // At least 2 weeks for weekly
        break;
      case 'BIWEEKLY':
        this.minEndDate.setDate(scheduledDate.getDate() + 28); // At least 4 weeks for biweekly
        break;
      case 'MONTHLY':
        this.minEndDate.setMonth(scheduledDate.getMonth() + 2); // At least 2 months for monthly
        break;
      default:
        this.minEndDate.setDate(scheduledDate.getDate() + 7); // Default minimum 1 week later
    }
  }

  /**
   * Fetch user by email to validate recipient
   */
  fetchUserByEmail(email: string): void {
    if (email === this.user?.email) {
      this.errorMessage = 'You cannot schedule a transfer to yourself';
      this.isUserFound = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.keycloakEventsService.checkUser({ email: email }).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.data) {
          this.recipient = data.data;
          this.isUserFound = true;
          this.errorMessage = '';
        } else {
          this.isUserFound = false;
          this.errorMessage = 'User not found';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isUserFound = false;
        this.errorMessage = err.error?.message || 'Error finding user';
        console.error('Error finding user:', err);
      }
    });
  }

  /**
   * Parse amount input
   */
  parseInputValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Convert to number
    const numValue = value ? parseFloat(value) : null;

    // Update the form control
    this.amountControl.setValue(numValue);

    // Update the input value to reflect the parsed value
    input.value = value ? value : '';
  }

  /**
   * Schedule transfer
   */
  scheduleTransfer(): void {
    this.validateTimeBasedOnSelectedDate();
    if (!this.scheduleTransferForm.valid) {
      this.markAllFormControlsAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fix the form errors before submitting'
      });
      return;
    }

    if (!this.isUserFound || !this.recipient) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Recipient not found or invalid'
      });
      return;
    }

    this.isLoading = true;

    // Combine date and time
    const scheduledDate = this.combineDateTime(
      this.dateControl.value ?? '',
      this.timeControl.value ?? ''
    );

    // Prepare end date if recurring
    let endDate = null;
    if (this.recurringControl.value && this.endDateControl.value) {
      // Set end date to end of day
      endDate = new Date(this.endDateControl.value);
      endDate.setHours(23, 59, 59);
    }

    // Format datetime to match Java LocalDateTime format (without timezone)
    const formattedScheduledDate = this.formatToLocalDateTime(scheduledDate);
    const formattedEndDate = endDate ? this.formatToLocalDateTime(endDate) : undefined;

    const body: ScheduledTransferRequestDto = {
      amount: this.amountControl.value!,
      description: this.narrationControl.value!,
      receiverEmail: this.emailControl.value!,
      senderEmail: this.user?.email!,
      scheduledDateTime: formattedScheduledDate,
      recurrenceType: this.recurringControl.value ?
        this.frequencyControl.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' :
        'NONE',
      recurrenceEndDate: formattedEndDate
    };

    this.scheduledTransferService.initiateScheduleTransfer({ body }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success === true && response.data?.scheduledTransferToken) {
          // Navigate to OTP verification page
          this.router.navigate(['/account/scheduled-transfer-otp'], {
            state: {
              scheduledTransferToken: response.data.scheduledTransferToken,
              amount: this.amountControl.value,
              recipientEmail: this.emailControl.value,
              recipientName: this.recipient?.firstName + ' ' + this.recipient?.lastName,
              scheduledDateTime: formattedScheduledDate,
              recurrenceType: this.recurringControl.value ? this.frequencyControl.value : 'NONE'
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to initiate scheduled transfer'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to initiate scheduled transfer'
        });
        console.error('Error initiating scheduled transfer:', err);
      }
    });
  }


  /**
   * Format date to LocalDateTime format expected by Java backend
   * Converts a Date to a string format compatible with Java's LocalDateTime
   */
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
   * Mark all form controls as touched to trigger validation
   */
  markAllFormControlsAsTouched(): void {
    Object.keys(this.scheduleTransferForm.controls).forEach(key => {
      const control = this.scheduleTransferForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Combine date and time strings into a Date object
   */
  combineDateTime(dateStr: string, timeStr: string): Date {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);

    date.setHours(hours, minutes, 0, 0);

    // Validate once more that the combined datetime is at least 15 minutes in the future
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 15 * 60 * 1000); // now + 15 minutes

    if (date < minDateTime) {
      // If date is in the past or less than 15 minutes in the future,
      // adjust it to be at least 15 minutes in the future
      const newTime = this.getTimeWithMinimumBuffer();
      const [newHours, newMinutes] = newTime.split(':').map(Number);
      date.setHours(newHours, newMinutes, 0, 0);

      // Update the form control to match the adjusted time
      this.timeControl.setValue(newTime);
    }

    return date;
  }

  /**
 * Check if the currently selected date is today
 */
  isToday(): boolean {
    if (!this.dateControl.value) {
      return false;
    }

    const selectedDate = new Date(this.dateControl.value);
    const today = new Date();

    return this.isSameDay(selectedDate, today);
  }

  /**
   * Go back to transactions page
   */
  cancel(): void {
    this.router.navigate(['/account/transactions'], {
      queryParams: { tab: 'scheduled' }
    });
  }
}