// user-inactivity.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserInactivityService {
  private timerId: any = null;

  constructor(private router: Router) {}

  startTimer() {
    this.timerId = setTimeout(() => this.logout(), 3600000); // 5 minutes
  }

  resetTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.startTimer();
  }

  stopTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.router.navigate(['/login']);
  }
}
