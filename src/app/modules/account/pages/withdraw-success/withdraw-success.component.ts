import {Component, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {GenericResponseWithdrawalData} from "../../../../services/models/generic-response-withdrawal-data";
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Router} from "@angular/router";
import { WithdrawStateService } from 'src/app/services/withdraw/withdraw-state.service';

@Component({
  selector: 'app-withdraw-success',
  templateUrl: './withdraw-success.component.html',
  styleUrls: ['./withdraw-success.component.css']
})
export class WithdrawSuccessComponent implements OnInit {

  withdrawalResponse: GenericResponseWithdrawalData = {};
  amount: number = 0;
  currentStep = 3;

  constructor(
    private location: Location,
    private stepsProgressService: StepsProgressServiceService,
    private router: Router,
    private withdrawStateService: WithdrawStateService
  ){
  }

  ngOnInit(): void {
    this.fetchTransactionDetails()
    this.initProgressService();

    // Clear state after successful display
  setTimeout(() => {
    if (this.withdrawalResponse && this.withdrawalResponse.status === 'success') {
      this.withdrawStateService.clearWithdrawState();
    }
  }, 1500);
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }


  fetchTransactionDetails() {
    // First try to get data from router state
    const response = this.location.getState() as {
      withdrawalResponse: GenericResponseWithdrawalData;
      amount: number;
    };
    
    if (response?.withdrawalResponse) {
      this.amount = response.amount;
      this.withdrawalResponse = response.withdrawalResponse;
      return;
    }
    
    // If router state is empty, try localStorage
    const savedState = this.withdrawStateService.getWithdrawState();
    
    if (savedState?.withdrawalResponse) {
      this.withdrawalResponse = savedState.withdrawalResponse;
      this.amount = savedState.amount || 0;
    } else {
      // If no data found, redirect back to withdraw page
      console.log('No withdrawal response found, redirecting to withdraw page');
      this.router.navigate(['/account/withdraw']);
    }
  }

  withdrawMoneyAgain() {
    // Clear state before starting a new withdrawal
    this.withdrawStateService.clearWithdrawState();
    this.router.navigate(['/account/withdraw']);
  }

  printReceipt(): void {
    window.print();
  }

}
