import {Component, OnDestroy, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {TransactionControllerService} from "../../../../services/services/transaction-controller.service";
import {PaymentInfoService} from "../../../../services/stripe/payment-info.service";
import {Transaction} from "../../../../services/models/transaction";
import { Location } from "@angular/common";
import { Router } from "@angular/router";



@Component({
  selector: 'app-deposit-failed',
  templateUrl: './deposit-failed.component.html',
  styleUrls: ['./deposit-failed.component.css']
})
export class DepositFailedComponent implements OnInit, OnDestroy{

  transactionRef: string | null = '';
  transaction: Transaction | undefined;

  errorMessage: string = '';
  isAnimationComplete = false;

  constructor(private stepsProgressService: StepsProgressServiceService,
              private transactionService: TransactionControllerService,
              private paymentInfoService: PaymentInfoService,
              private location: Location,
              private router: Router
              ) {

  }

  ngOnDestroy(): void {
  }

  updateTransaction(){
    this.transactionService.updateTransactionStatus({
      referenceNumber: this.transactionRef!,
      body: {
        status: 'CANCELLED'
      }
    }).subscribe(transaction => {
      this.transaction = transaction.data;
      console.log(transaction);
    });
  }

  ngOnInit(): void {
    this.transactionRef = this.paymentInfoService.getTransactionReference();
    //this.initProgressService()
    this.getTransactionData()
    this.updateTransaction();

    setTimeout(() => {
      this.isAnimationComplete = true;
    }, 1200);
  }

  // initProgressService() {
  //   this.stepsProgressService.setSteps(['Deposit', 'Deposit Confirm']);
  //   this.stepsProgressService.setCurrentStep(2);
  // }

  getTransactionData() {
    const state = this.location.getState() as {
      transaction: any;
      errorMessage: string;
    };

    this.transaction = state.transaction;
    this.errorMessage = state.errorMessage || 'Transaction was cancelled or could not be completed';
  }

  printDetails(): void {
    window.print();
  }

  tryAgain(): void {
    this.router.navigate(['/account/deposit']);
  }

  goToDashboard(): void {
    this.router.navigate(['/account/dashboard']);
  }

}
