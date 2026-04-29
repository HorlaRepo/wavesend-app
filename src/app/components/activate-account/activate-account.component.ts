import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css'],
  providers: [MessageService]
})
export class ActivateAccountComponent implements OnInit {
  message = '';
  isOkay = true;
  submitted = false;
  userEmail = '';
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get email from query params if available
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
    });
  }

  onCodeCompleted(token: string) {
    this.confirmAccount(token);
  }

  navigateToLogin() {
    this.router.navigate(['login']);
  }

  private confirmAccount(token: string) {
    this.isLoading = true;
    this.authService.activateAccount(token).subscribe({
      next: (response) => {
        this.message = response.message || 'Account activated successfully. You can now login.';
        this.isOkay = true;
        this.submitted = true;
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.message
        });
      },
      error: err => {
        this.message = err.error?.message || 'Invalid or expired token. Please try again.';
        this.isOkay = false;
        this.submitted = true;
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Activation Failed',
          detail: this.message
        });
      }
    });
  }
}
