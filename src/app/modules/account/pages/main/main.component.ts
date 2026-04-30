import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InactivityService } from '../../../../services/inactivity/inactivity.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  showInactivityModal = false;
  countdown = 30;

  private warningSub!: Subscription;
  private countdownSub!: Subscription;

  constructor(private inactivityService: InactivityService) {}

  ngOnInit(): void {
    this.inactivityService.startMonitoring();

    this.warningSub = this.inactivityService.showWarning$.subscribe(show => {
      this.showInactivityModal = show;
    });

    this.countdownSub = this.inactivityService.countdown$.subscribe(seconds => {
      this.countdown = seconds;
    });
  }

  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
    this.warningSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  dismissModal(): void {
    this.inactivityService.dismissWarning();
  }

  logoutNow(): void {
    this.inactivityService.logoutNow();
  }

  prepareRoute(outlet: any) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
