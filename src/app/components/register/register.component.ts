import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterRequest } from '../../services/auth/auth.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [MessageService, DatePipe]
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  isLoading = false;
  registrationSuccess = false;
  errorMessage = '';

  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {
    const currentDate = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(currentDate.getFullYear() - 100);
    this.maxDate = new Date();
    this.maxDate.setFullYear(currentDate.getFullYear() - 18);
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/account']);
      return;
    }

    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('[- +()0-9]+')]]
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValues = this.registrationForm.value;

    if (formValues.password !== formValues.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Passwords do not match'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: RegisterRequest = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      password: formValues.password,
      dateOfBirth: formValues.dateOfBirth,
      phoneNumber: formValues.phoneNumber
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: 'Please check your email for the activation code.'
        });
        // Navigate to activation page with email as query param
        this.router.navigate(['/activate-account'], {
          queryParams: { email: formValues.email }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.validationErrors) {
          this.errorMessage = err.error.validationErrors.join(', ');
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: this.errorMessage
        });
      }
    });
  }
}
