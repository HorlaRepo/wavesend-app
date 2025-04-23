import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { StepsProgressServiceService } from "../../../../services/steps-progress/steps-progress-service.service";
import { GenericResponseWithdrawalData } from "../../../../services/models/generic-response-withdrawal-data";
import { Router } from "@angular/router";
import { WithdrawStateService } from 'src/app/services/withdraw/withdraw-state.service';

@Component({
  selector: 'app-withdraw-failed',
  templateUrl: './withdraw-failed.component.html',
  styleUrls: ['./withdraw-failed.component.css']
})
export class WithdrawFailedComponent implements OnInit {

  amount: number = 0;
  errorMessage: string = '';
  currentStep = 2;
  withdrawResponse: GenericResponseWithdrawalData = {};
  isAnimationComplete = false;

  constructor(
    private location: Location,
    private stepsProgressService: StepsProgressServiceService,
    private router: Router,
    private withdrawStateService: WithdrawStateService
  ) { }

  ngOnInit(): void {
    this.initProgressService();
    this.fetchTransactionDetails();
    
    // Set animation complete flag after animation finishes
    setTimeout(() => {
      this.isAnimationComplete = true;
    }, 1200);
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Failed']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  fetchTransactionDetails() {
    const response = this.location.getState() as {
      totalAmountInLocalCurrency: number;
      errorMessage: string;
      withdrawResponse: GenericResponseWithdrawalData;
    };

    this.amount = response.totalAmountInLocalCurrency;

    if(response.errorMessage) {
      this.errorMessage = response.errorMessage;
    } else {
      this.errorMessage = 'An error occurred while processing your withdrawal request. Please try again later.';
    }
  }

  fetchErrorDetails(): void {
    // Try to get data from router state first
    const state = this.location.getState() as any;
    
    console.log('Router state:', state);
    
    // Check if error data is available in the router state
    if (state && state.errorMessage) {
      this.errorMessage = state.errorMessage;
      
      // Make sure amount is a number
      this.amount = typeof state.amount === 'number' ? state.amount : 0;
      console.log('Amount from router state:', this.amount);
    } else {
      // If not in router state, try to get from withdraw state service
      const savedState = this.withdrawStateService.getWithdrawState();
      console.log('Saved state:', savedState);
      
      if (savedState) {
        // Set error message
        this.errorMessage = savedState.errorMessage || 'Your withdrawal could not be processed';
        
        // Make sure we handle the amount correctly
        if (savedState.amount !== undefined && savedState.amount !== null) {
          this.amount = Number(savedState.amount); // Ensure it's a number
          console.log('Amount from saved state:', this.amount);
        }
      } else {
        // Default error message
        this.errorMessage = 'An unknown error occurred';
        console.log('No state found, using default error message');
      }
    }
    
    // If we still don't have an amount, check if there's a transfer in progress
    if (!this.amount) {
      const currentState = this.withdrawStateService.getWithdrawState();
      if (currentState?.amount) {
        this.amount = Number(currentState.amount);
        console.log('Amount from current state:', this.amount);
      }
    }
  }

  

  withdrawMoneyAgain() {
    this.withdrawStateService.clearWithdrawState();
    this.router.navigate(['/account/withdraw']);
  }

  printDetails(): void {
    // Print or log error details for support
    console.log('Error details:', {
      message: this.errorMessage,
      amount: this.amount,
      timestamp: new Date().toISOString()
    });
    
    // Could open a support modal or redirect to support page
    alert('Support information has been logged. Please contact support with these details.');
  }


}