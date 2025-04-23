import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StepsProgressServiceService {

  private currentStepSubject = new BehaviorSubject<number>(0);
  currentStep$ = this.currentStepSubject.asObservable();

  private stepsSubject = new BehaviorSubject<string[]>([]);
  steps$ = this.stepsSubject.asObservable();

  private depositStatus = new BehaviorSubject<string>('');
  depositStatus$ = this.depositStatus.asObservable();

  setCurrentStep(step: number) {
    this.currentStepSubject.next(step);
  }

  setSteps(steps: string[]) {
    this.stepsSubject.next(steps);
  }

  setDepositStatus(status: string) {
    this.depositStatus.next(status);
  }

  goToPreviousStep() {
    let currentStep = this.currentStepSubject.getValue();
    if (currentStep > 0) {
      this.currentStepSubject.next(currentStep - 1);
    }
  }
}
