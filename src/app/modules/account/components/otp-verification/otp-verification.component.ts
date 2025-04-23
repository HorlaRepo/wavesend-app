import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @Input() operationType: 'transfer' | 'withdrawal' | 'scheduledTransfer' = 'transfer';
  @Input() email: string = '';
  @Output() verifyOtp = new EventEmitter<string>();
  @Output() resendOtp = new EventEmitter<void>();
  
  otpForm: FormGroup;
  otpDigits: FormControl[] = [];
  
  timerRunning = true;
  timerValue = 60; // 1 minute countdown
  timerSubscription: Subscription | null = null;
  
  isLoading = false;
  
  constructor() {
    // Create 6 form controls for OTP digits
    for (let i = 0; i < 6; i++) {
      this.otpDigits.push(new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]')
      ]));
    }
    
    this.otpForm = new FormGroup({
      digit1: this.otpDigits[0],
      digit2: this.otpDigits[1],
      digit3: this.otpDigits[2],
      digit4: this.otpDigits[3],
      digit5: this.otpDigits[4],
      digit6: this.otpDigits[5]
    });
  }
  
  ngOnInit(): void {
    this.startTimer();
  }
  
  ngOnDestroy(): void {
    this.stopTimer();
  }
  
  startTimer(): void {
    this.stopTimer();
    this.timerValue = 60;
    this.timerRunning = true;
    
    this.timerSubscription = interval(1000)
      .pipe(
        take(61),
        map(count => 60 - count)
      )
      .subscribe(value => {
        this.timerValue = value;
        if (value === 0) {
          this.timerRunning = false;
          this.stopTimer();
        }
      });
  }
  
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
  
  onDigitInput(event: any, currentIndex: number): void {
    const input = event.target;
    const value = input.value;
    
    // Auto-focus next input
    if (value.length === 1 && currentIndex < 5) {
      const nextInput = document.getElementById(`digit${currentIndex + 2}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Auto-submit when all digits are entered
    if (this.otpForm.valid) {
      this.submitOtp();
    }
  }
  
  onKeyDown(event: KeyboardEvent, currentIndex: number): void {
    // Handle backspace
    if (event.key === 'Backspace' && currentIndex > 0) {
      const currentInput = event.target as HTMLInputElement;
      
      // If current input is empty, move to previous input
      if (!currentInput.value) {
        const prevInput = document.getElementById(`digit${currentIndex}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  }
  
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    
    const pastedText = clipboardData.getData('text').trim();
    if (!pastedText.match(/^\d{6}$/)) return; // Only allow 6 digits
    
    for (let i = 0; i < 6 && i < pastedText.length; i++) {
      this.otpDigits[i].setValue(pastedText[i]);
    }
    
    // Auto-submit when pasting a complete OTP
    if (this.otpForm.valid) {
      this.submitOtp();
    }
  }
  
  submitOtp(): void {
    if (this.otpForm.valid) {
      const otp = this.otpDigits.map(control => control.value).join('');
      this.verifyOtp.emit(otp);
    }
  }
  
  handleResendOtp(): void {
    if (!this.timerRunning) {
      this.resendOtp.emit();
      this.startTimer();
      
      // Reset OTP form
      this.otpForm.reset();
      document.getElementById('digit1')?.focus();
    }
  }
  
  getOperationName(): string {
    switch (this.operationType) {
      case 'transfer': return 'Money Transfer';
      case 'withdrawal': return 'Withdrawal';
      case 'scheduledTransfer': return 'Scheduled Transfer';
      default: return 'Transaction';
    }
  }
}