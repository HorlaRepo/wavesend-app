import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";

@Component({
  selector: 'app-steps-progress-bar',
  templateUrl: './steps-progress-bar.component.html',
  styleUrls: ['./steps-progress-bar.component.css']
})
export class StepsProgressBarComponent implements OnInit, OnDestroy{
  currentStep: number = 0;
  steps: string[] = [];
  depositStatus: string = '';
  progressPercentage: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private stepsProgressService: StepsProgressServiceService) {}

  ngOnInit() {
    this.subscription = this.stepsProgressService.currentStep$.subscribe(step => {
      this.currentStep = step;
    });

    this.subscription.add(
      this.stepsProgressService.steps$.subscribe(steps => {
        this.steps = steps;
        this.depositStatus = steps[steps.length - 1];
        this.updateProgressPercentage();
      })
    );
  }

  isFailedStatus(status: string): boolean {
    // Add all possible failure status strings here
    return status === 'Deposit Failed' || 
           status === 'Failed' || 
           status === 'Transfer Failed' || 
           status === 'Payment Failed' ||
           status.toLowerCase().includes('failed');
  }  
  

  updateProgressPercentage(): void {
    if (this.steps.length > 1) {
      // Cap the progress at 100% to prevent overflow
      const maxStep = this.steps.length - 1;
      const stepProgress = Math.min(this.currentStep, maxStep);
      this.progressPercentage = (stepProgress / maxStep) * 100;
    } else {
      this.progressPercentage = 0;
    }
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
