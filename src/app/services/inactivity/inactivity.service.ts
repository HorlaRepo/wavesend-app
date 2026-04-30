import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimeout: any;
  private countdownInterval: any;

  private readonly INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutes
  private readonly WARNING_BEFORE = 30 * 1000; // Show warning 30s before logout
  private readonly COUNTDOWN_SECONDS = 30;

  public showWarning$ = new Subject<boolean>();
  public countdown$ = new Subject<number>();

  private isMonitoring = false;
  private events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  constructor(
    private ngZone: NgZone,
    private authService: AuthService
  ) {}

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    this.ngZone.runOutsideAngular(() => {
      this.events.forEach(event => {
        document.addEventListener(event, () => this.resetTimer(), { passive: true });
      });
    });

    this.resetTimer();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.events.forEach(event => {
      document.removeEventListener(event, () => this.resetTimer());
    });
    this.clearTimers();
    this.showWarning$.next(false);
  }

  dismissWarning(): void {
    this.clearTimers();
    this.showWarning$.next(false);
    this.resetTimer();
  }

  logoutNow(): void {
    this.clearTimers();
    this.showWarning$.next(false);
    this.authService.logout();
  }

  private resetTimer(): void {
    this.clearTimers();

    this.inactivityTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.startCountdown();
      });
    }, this.INACTIVITY_LIMIT - this.WARNING_BEFORE);
  }

  private startCountdown(): void {
    let secondsLeft = this.COUNTDOWN_SECONDS;
    this.showWarning$.next(true);
    this.countdown$.next(secondsLeft);

    this.countdownInterval = setInterval(() => {
      secondsLeft--;
      this.countdown$.next(secondsLeft);

      if (secondsLeft <= 0) {
        this.logoutNow();
      }
    }, 1000);
  }

  private clearTimers(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}
