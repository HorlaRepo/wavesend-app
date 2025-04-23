import {Component, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Location} from "@angular/common";
import {MessageService} from "primeng/api";
import {TransactionControllerService} from "../../../../services/services/transaction-controller.service";
import {Router} from "@angular/router";
import {PaymentProcessingControllerService} from "../../../../services/services/payment-processing-controller.service";
import {GenericResponseWithdrawalData} from "../../../../services/models/generic-response-withdrawal-data";
import {BankAccount} from "../../../../services/models/bank-account";
import {Wallet} from "../../../../services/models/wallet";
import { WithdrawStateService } from 'src/app/services/withdraw/withdraw-state.service';
import { WithdrawalControllerService } from 'src/app/services/services';

@Component({
  selector: 'app-withdraw-confirm',
  templateUrl: './withdraw-confirm.component.html',
  styleUrls: ['./withdraw-confirm.component.css'],
  providers: [MessageService]
})
export class WithdrawConfirmComponent implements OnInit {
  bankAccount: BankAccount = {};
  wallet: Wallet = {};
  transactionValues: any;
  amountWithFee = 0;
  isLoading = false;
  withdrawalResponse: GenericResponseWithdrawalData = {};
  errorMessage = '';
  eWithdrawalData = {};


  currentStep = 1;

  constructor(private stepsProgressService: StepsProgressServiceService,
              private location: Location,
              private transactionService: TransactionControllerService,
              private messageService: MessageService,
              private router: Router,
              private paymentProcessingService: PaymentProcessingControllerService,
              private withdrawStateService: WithdrawStateService,
              private withdrawalService: WithdrawalControllerService
            ){
  }

  ngOnInit(): void {
    this.initProgressService();
    this.getWithdrawalDetails();
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Verify', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  initiateWithdrawal() {
    this.isLoading = true;
    this.withdrawalService.initiateWithdrawal({
      body: {
        amount: this.transactionValues.amount,
        fee: this.transactionValues.transactionFee,
        withdrawalInfo: {
          amount: this.transactionValues.totalAmountInLocalCurrency,
          currency: this.transactionValues.currency,
          narration: this.transactionValues.narration,
          bankAccount: this.bankAccount
        },
        walletId: this.wallet.walletId
      }
    }).subscribe({
      next: response => {
        this.isLoading = false;
        if(response.status === 'success' && response.data?.withdrawalToken) {
          // Store withdrawal state for recovery if needed
          this.withdrawStateService.updateWithdrawState({
            withdrawalToken: response.data.withdrawalToken
          });
          
          // Navigate to OTP verification page
          this.router.navigate(['/account/withdraw-otp'], {
            state: {
              withdrawalToken: response.data.withdrawalToken,
              amount: this.transactionValues.amount,
              bankAccount: this.bankAccount,
              totalAmount: this.transactionValues.totalAmountInLocalCurrency
            }
          });
          
          // Update progress step
          this.stepsProgressService.setCurrentStep(2); // OTP verification step
        } else {
          this.showErrorMessage(response.message || 'Failed to initiate withdrawal');
        }
      }, 
      error: err => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Failed to initiate withdrawal';
        this.showErrorMessage(errorMessage);
        this.errorMessage = errorMessage;
        
        // Store error for display on error page if needed
        this.withdrawStateService.updateWithdrawState({
          errorMessage: errorMessage,
          amount: this.transactionValues?.amount
        });
      }
    });
  }

  getWithdrawalDetails() {
    // First try to get data from router state for smoother transitions
    const withdrawalDetails = this.location.getState() as {
      selectedBank: BankAccount; 
      transactionValues: any;
      wallet: Wallet;
    };
  
    // Check if we have data from router state
    if (withdrawalDetails?.selectedBank && withdrawalDetails?.transactionValues && withdrawalDetails?.wallet) {
      this.transactionValues = withdrawalDetails.transactionValues;
      this.bankAccount = withdrawalDetails.selectedBank;
      this.wallet = withdrawalDetails.wallet;
      this.amountWithFee = Number(this.transactionValues.amount) + Number(this.transactionValues.transactionFee);
      this.transactionValues.totalAmountInLocalCurrency = Number(this.transactionValues.totalAmountInLocalCurrency).toFixed(2);
    } else {
      // If router state is empty, try localStorage
      const savedState = this.withdrawStateService.getWithdrawState();
      
      if (savedState?.selectedBank && savedState?.amount) {
        this.bankAccount = savedState.selectedBank;
        this.wallet = savedState.wallet!;
        
        this.transactionValues = {
          amount: savedState.amount,
          narration: savedState.narration,
          transactionFee: savedState.transactionFee,
          processingFee: savedState.processingFee,
          totalAmountInLocalCurrency: savedState.totalAmountInLocalCurrency?.toFixed(2),
          currency: savedState.currency,
          exchangeRate: savedState.exchangeRate,
        };
        
        this.amountWithFee = Number(savedState.amount) + Number(savedState.transactionFee);
      } else {
        // If no state found, redirect back to initial withdraw page
        console.log('No withdrawal data found, redirecting to withdraw page');
        this.router.navigate(['/account/withdraw']);
        return;
      }
    }
    
    console.log("WalletId: " + this.wallet?.walletId);
  }

  // processWithdrawal(){
  //   this.isLoading = true;
  //   this.paymentProcessingService.withdraw({
  //     body: {
  //       amount: this.transactionValues.amount,
  //       fee: this.transactionValues.transactionFee,
  //       withdrawalInfo: {
  //         amount: this.transactionValues.totalAmountInLocalCurrency,
  //         currency: this.transactionValues.currency,
  //         narration: this.transactionValues.narration,
  //         bankAccount: this.bankAccount
  //       },
  //       walletId: this.wallet.walletId
  //     }
  //   }).subscribe({
  //     next: response => {
  //       this.isLoading = false;
  //       console.log("WalletID:  " + this.wallet.walletId)
  //       if(response.status === 'success'){
  //         this.stepsProgressService.setCurrentStep(3);
  //         console.log(response)
  //         this.showSuccessMessage(response.message as string);
  //         this.withdrawalResponse = response as GenericResponseWithdrawalData;
  //         this.withdrawStateService.updateWithdrawState({
  //           withdrawalResponse: this.withdrawalResponse
  //         });
  //         this.navigateToSuccess();
  //       } else {
  //         this.showErrorMessage(response.message as string);
  //         this.navigateToFailure(this.withdrawalResponse);
  //       }
  //     }, error: err => {
  //       this.isLoading = false;
  //       const errorMessage = err.error?.message || 'Failed to process withdrawal';
  //       this.showErrorMessage(errorMessage);
  //       this.showErrorMessage(errorMessage);

  //       this.withdrawStateService.updateWithdrawState({
  //         errorMessage: errorMessage,
  //         amount: this.transactionValues?.amount
  //       });
  //       this.errorMessage = err.error.message;
  //       this.navigateToFailure(this.errorMessage);
  //       console.log(err.error);
  //     }
  //   })
  // }

  showErrorMessage(message: string){
    this.messageService.add({severity:'error', summary:'Error', detail:message});
  }

  showSuccessMessage(message: string){
    this.messageService.add({severity:'success', summary:'Success', detail:message});
  }

  navigateToSuccess(){
    this.router.navigate(['/account/withdraw-success'] ,
      {state: {withdrawalResponse: this.withdrawalResponse, amount: this.transactionValues.amount, currency: this.transactionValues.currency}
      }
    );
  }

  navigateToFailure(data: any){
    this.router.navigate(['/account/withdraw-failed']
      , {
        state: {
        withdrawalResponse: data, 
        amount: this.transactionValues.totalAmountInLocalCurrency, 
        errorMessage: this.errorMessage
      }});
  }

  
  
  goBack(): void {
    // Navigate back but preserve the state
    this.router.navigate(['/account/withdraw']);
    this.stepsProgressService.setCurrentStep(0);
  }
}
