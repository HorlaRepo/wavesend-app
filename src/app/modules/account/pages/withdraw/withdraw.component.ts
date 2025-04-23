import { Component, OnDestroy, OnInit } from '@angular/core';
import { StepsProgressServiceService } from "../../../../services/steps-progress/steps-progress-service.service";
import { Router } from "@angular/router";
import { BankAccountControllerService } from "../../../../services/services/bank-account-controller.service";
import { TransactionControllerService } from "../../../../services/services/transaction-controller.service";
import { debounceTime } from 'rxjs/operators';
import { Subject } from "rxjs";
import { CountryControllerService } from "../../../../services/services/country-controller.service";
import {FormControl, Validators} from '@angular/forms';
import { FlutterwaveControllerService } from "../../../../services/services/flutterwave-controller.service";
import { ExchangeData } from "../../../../services/models/exchange-data";
import { FeeData } from "../../../../services/models/fee-data";
import { BankAccount } from "../../../../services/models/bank-account";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {InputParserService} from "../../../../services/input-parser/input-parser.service";
import {PaymentProcessingControllerService} from "../../../../services/services/payment-processing-controller.service";
import {UserInfo} from "../../../../services/keycloack/user-info";
import {Wallet} from "../../../../services/models/wallet";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {WalletControllerService} from "../../../../services/services/wallet-controller.service";
import { WithdrawStateService } from 'src/app/services/withdraw/withdraw-state.service';

declare var $: any;

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit, OnDestroy {

  user: UserInfo | undefined;
  wallet: Wallet | undefined;
  faSpinner = faSpinner;
  currentStep = 0;
  banksList: Array<BankAccount> | undefined = [];
  amount: number = 0.00;
  narration: string | undefined;
  countryAcronym: string | undefined;
  transactionFee: number = 0;
  userBalance: number = 0;
  currency: string | undefined;
  processingFee: number = 0;
  isLoading = false;
  amountControl = new FormControl(0);
  amountChanged: Subject<number> = new Subject<number>();
  totalAmountInLocalCurrency: number = 0;
  exchangeData: ExchangeData | undefined;
  exchangeRate = 0;
  feeData: FeeData[] | undefined;
  walletCurrency: string | undefined;
  errorMessage: string | undefined
  bankControl = new FormControl('', Validators.required);
  isLoadingBanksList = false;
  bankAccountLoadingResult = false;

  constructor(
    private stepsProgressService: StepsProgressServiceService,
    private router: Router,
    private bankAccountService: BankAccountControllerService,
    private transactionService: TransactionControllerService,
    private countryService: CountryControllerService,
    private flutterwaveService: FlutterwaveControllerService,
    private inputParserService: InputParserService,
    private paymentProcessingService: PaymentProcessingControllerService,
    private keycloakService: KeycloakService,
    private walletService: WalletControllerService,
    private withdrawStateService: WithdrawStateService
  ) {
    this.amountControl = new FormControl(0, [Validators.required, this.nonZeroValidator.bind(this), Validators.min(1) ]);
  }

  async ngOnInit(): Promise<void> {
    this.initFormControl();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    await this.setUser();
    this.initProgressService();
    this.amountChanged.pipe(
      debounceTime(500)
    ).subscribe(() => {
      if (!this.amount || this.amount === 0) {
        this.resetFees();
      } else {
        this.getTransactionFee().then(() => {
          this.getExchangeRate();
        });
      }
    });
    if (this.banksList && this.banksList.length > 0 && this.banksList[0].bankName) {
      this.bankControl.setValue(this.banksList[0].bankName);
    }
  }

  /**
 * Restore form values from saved state
 */
restoreFormValues(): void {
  const withdrawState = this.withdrawStateService.getWithdrawState();
  
  if (withdrawState) {
    // Restore amount if available
    if (withdrawState.amount !== undefined && withdrawState.amount !== null) {
      this.amount = withdrawState.amount;
      this.amountControl.setValue(withdrawState.amount);
    }
    
    // Restore narration if available
    if (withdrawState.narration) {
      this.narration = withdrawState.narration;
    }
    
    // Restore selected bank if available
    if (withdrawState.selectedBank && this.banksList?.length) {
      const bankToSelect = this.banksList.find(bank => 
        bank.accountNumber === withdrawState.selectedBank?.accountNumber &&
        bank.bankName === withdrawState.selectedBank?.bankName
      );
      
      if (bankToSelect?.bankName) {
        setTimeout(() => {
          this.bankControl.setValue(bankToSelect.bankName!);
        }, 100);
      }
    }
    
    // Trigger fee and exchange rate calculations
    if (withdrawState.amount) {
      this.amountChanged.next(withdrawState.amount);
    }
  }
}

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  async setUser() {
      this.user = this.keycloakService.userInfo;
      this.wallet = await this.keycloakService.fetchUserWallet();
      this.userBalance = this.wallet?.balance as number;
      this.walletCurrency = this.wallet?.currency as string;
      console.log(this.user);
      this.fetchBankList();
      this.getCountry();
      this.initFormControl();
  }

  fetchBankList() {
    this.isLoadingBanksList = true;
    this.bankAccountService.getBankAccountsByUser().subscribe({
      next: data => {
        if(!data.success){
          this.bankAccountLoadingResult = false;
        }
        this.banksList = data.data;
        this.isLoadingBanksList = false;
        this.bankAccountLoadingResult = true;
        console.log(data);
      },
      error: err => {
        console.error(err.error);
        this.isLoadingBanksList = false;
      }
    });
  }

  parseInputValue(event: Event): void {
    this.amountControl.setValue(this.inputParserService.parseInputValue(event));
  }

  numericOnly(event: KeyboardEvent): boolean {
    const char = event.key;
    if (char === 'Backspace' || char === 'Delete') {
      return true;
    }
    if (char === ' ') {
      event.preventDefault();
      return false;
    }
    return !isNaN(Number(char));
  }

  getCountry() {
    this.countryService.getCountryByName({
      countryName: this.user?.address.country  as string
    }).subscribe({
      next: data => {
        this.countryAcronym = data.data?.acronym as string;
        this.currency = data.data?.currency as string;
        console.log(data.data);
      },
      error: err => {
        console.error(err.error);
      }
    });
  }

  async getTransactionFee() {
    return new Promise<void>((resolve, reject) => {
      if (!this.amount || isNaN(this.amount)) {
        this.transactionFee = 0;
        this.amountControl.setErrors(null);
        resolve();
        return;
      }
      this.isLoading = true;
      this.transactionFee = 0;
      this.totalAmountInLocalCurrency = 0;
      this.processingFee = 0;
      this.transactionService.getTransactionFee({
        amount: this.amount as number
      }).subscribe({
        next: data => {
          console.log(data);
          this.transactionFee = data.data?.fee as number;
          this.isLoading = false;
          resolve();
        },
        error: err => {
          console.error(err.error);
          this.isLoading = false;
          reject(err);
        }
      });
    });
  }

  getExchangeRate() {
    this.isLoading = true;
    this.flutterwaveService.getExchangeRate({
      request: {
        amount: this.amount as number,
        destinationCurrency: this.walletCurrency as string,
        sourceCurrency: this.currency as string
      }
    }).subscribe({
      next: data => {
        this.exchangeData = data.data;
        this.exchangeRate = this.exchangeData?.rate as number;
        console.log(this.exchangeData);
        this.getProcessingFee();
        this.isLoading = false;
      },
      error: err => {
        console.error(err.error);
        this.isLoading = false;
      }
    });
  }

  getProcessingFee() {
    if(this.amountControl.valid)
    this.isLoading = true;
    this.flutterwaveService.getFees({
      amount: this.exchangeData?.rate as number,
      currency: this.currency as string
    }).subscribe({
      next: data => {
        console.log(data.data);
        console.log("Rate: " + this.exchangeData?.rate);
        this.feeData = data.data;
        const feeType = data.data ? data.data.at(0)?.fee_type : '';
        this.processingFee = data.data ? data.data.at(0)?.fee as number : 0;
        this.totalAmountInLocalCurrency = (this.amount * this.exchangeRate);
        if(feeType === 'percentage') {
          this.processingFee = (this.processingFee / 100) * (this.totalAmountInLocalCurrency);
          this.totalAmountInLocalCurrency = this.totalAmountInLocalCurrency  - this.processingFee;
        } else if (feeType === 'value') {
          this.totalAmountInLocalCurrency = this.totalAmountInLocalCurrency - this.processingFee;
        }
      },
      error: err => {
        console.error(err.error);
        this.isLoading = false;
      }
    });
  }

  resetFees() {
    this.transactionFee = 0;
    this.processingFee = 0;
    this.totalAmountInLocalCurrency = 0;
  }

  async setFullAmount(): Promise<void> {
    let potentialAmount = this.userBalance;
    this.amount = potentialAmount;

    this.isLoading = true;
    try {
      await this.getTransactionFee();
      while (potentialAmount + this.transactionFee > this.userBalance) {
        potentialAmount -= 1;
        this.amount = potentialAmount;
        await this.getTransactionFee();
      }
      this.amount = potentialAmount;
      this.amountControl.setValue(potentialAmount);
      this.getExchangeRate();
      this.checkBalance();
      this.isLoading = false;
    } catch (error) {
      console.error('Failed to get transaction fee', error);
    }
  }

  initFormControl() {
    this.amountControl.valueChanges.subscribe(value => {
      this.amount = value as number;
      this.amountChanged.next(value as number);
      this.checkBalance();
      if (!value) {
        this.resetFees();
      }
      this.checkBalance();
    });
  }

  checkBalance() {
    if (Number(this.amount!) + Number(this.transactionFee) > Number(this.userBalance)) {
      console.log((this.amount!+this.transactionFee), this.userBalance)
      this.amountControl.setErrors({ exceededBalance: true });
      this.errorMessage = 'Amount exceeds balance';
    } else if (this.amountControl.invalid || this.amountControl.value === 0) {
      this.amountControl.setErrors({ exceededBalance: true });
      this.errorMessage = 'Amount is required';
    } else {
      this.amountControl.setErrors(null);
      this.errorMessage = undefined;
    }
  }


  goToNextStep() {
    if(this.amountControl.valid && this.bankControl.valid) {
      const selectedBankName = this.bankControl.value;
      const selectedBank = this.banksList?.find(bank => bank.bankName === selectedBankName);
      console.log(selectedBank);
      const wallet = this.wallet;
      
      if (selectedBank) {
        console.log(selectedBank);
        const transactionValues = {
          amount: this.amountControl.value,
          narration: this.narration,
          transactionFee: this.transactionFee,
          processingFee: this.processingFee,
          totalAmountInLocalCurrency: this.totalAmountInLocalCurrency,
          currency: this.currency,
          exchangeRate: this.exchangeRate,
        };
        
        // Save state before navigating
        this.withdrawStateService.saveWithdrawState({
          amount: this.amountControl.value!,
          narration: this.narration,
          transactionFee: this.transactionFee,
          processingFee: this.processingFee,
          totalAmountInLocalCurrency: this.totalAmountInLocalCurrency,
          currency: this.currency,
          exchangeRate: this.exchangeRate,
          selectedBank: selectedBank,
          wallet: wallet
        });
  
        this.router.navigate(['/account/withdraw-confirm'],
          { state: { selectedBank, transactionValues, wallet } }).then(r => {
          this.stepsProgressService.setCurrentStep(1);
        });
      }
    } else {
      this.amountControl.markAllAsTouched();
    }
  }

  goToPreviousStep() {
    this.currentStep--;
  }

  ngOnDestroy(): void { }

  nonZeroValidator(control: FormControl): {[key: string]: boolean} | null {
    const value = control.value;
    if (control.touched && (value === null || value === undefined || value === '' || value === 0 || value.min < 1)) {
      return { 'nonZero': true };
    }
    if (control.touched && control.value < 1) {
      return {'min': true};
    }
    return null;
  }

  protected readonly HTMLInputElement = HTMLInputElement;
  protected readonly Number = Number;

  getSelectedBank(): BankAccount | undefined {
    const selectedBankName = this.bankControl.value;
    return this.banksList?.find(bank => bank.bankName === selectedBankName);
  }
}
