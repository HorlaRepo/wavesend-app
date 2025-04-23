import { Component, OnInit } from '@angular/core';
import { StepsProgressServiceService } from "../../../../services/steps-progress/steps-progress-service.service";
import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { AbstractControl, FormControl, ValidatorFn, Validators } from "@angular/forms";
import { debounceTime } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { InputParserService } from "../../../../services/input-parser/input-parser.service";
import { Router } from "@angular/router";
import { UserInfo } from "../../../../services/keycloack/user-info";
import { UserRepresentation } from "../../../../services/models/user-representation";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { KeycloakEventsControllerService } from "../../../../services/services/keycloak-events-controller.service";
import { WalletControllerService } from "../../../../services/services/wallet-controller.service";
import { Wallet } from "../../../../services/models/wallet";
import { TransferBeneficiaryService } from 'src/app/services/beneficiary/transfer-beneficiary.service';
import { TransferState, TransferStateService } from 'src/app/services/transfer/transfer-state.service';
import { UserBeneficiaryRequest, UserBeneficiaryResponse } from 'src/app/services/models';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-send-money',
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.css'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ],
  providers: [MessageService]
})
export class SendMoneyComponent implements OnInit {

  isSendingToSelf = false;
  currentStep = 0;
  errorMessage = '';
  amountControlError = '';
  isLoading = false;
  isUserFound = false;
  emailControl = new FormControl('', [Validators.email, Validators.required]);
  amountControl = new FormControl(0.00, [Validators.required, Validators.min(1)]);
  narrationControl = new FormControl('', [Validators.required]);
  recipient: UserRepresentation | undefined;
  user: UserInfo | undefined;
  wallet: Wallet | undefined;
  balance = 0;
  showBeneficiarySelector = false;
  selectedBeneficiary: UserBeneficiaryRequest | null = null;

  beneficiaries: UserBeneficiaryResponse[] = [];

  constructor(
    private stepsProgressService: StepsProgressServiceService,
    private inputParserService: InputParserService,
    private router: Router,
    private keycloakService: KeycloakService,
    private keycloakEventsService: KeycloakEventsControllerService,
    private walletService: WalletControllerService,
    private beneficiaryService: TransferBeneficiaryService,
    private transferStateService: TransferStateService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.setUser().then(() => {
      this.restoreFormValuesFromState();
    });

    this.emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(value => {
      this.fetchUserByEmail(value!);
      this.checkIfSenderIsReceiver(value!);
      if (!this.emailControl.valid) {
        this.emailControl.setErrors({ 'invalid': true })
      }
    });

    this.amountControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => {

    });
    this.initProgressService();

    // Subscribe to loading state
    this.beneficiaryService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to beneficiaries
    this.beneficiaryService.beneficiaries$.subscribe(beneficiaries => {
      this.beneficiaries = beneficiaries;
    });

    // Load beneficiaries
    this.loadBeneficiaries();
  }

  openBeneficiarySelector(event: Event): void {
    event.preventDefault();
    this.showBeneficiarySelector = true;
    
    // Refresh beneficiaries list when opening the selector
    this.loadBeneficiaries();
  }

  closeBeneficiarySelector(): void {
    this.showBeneficiarySelector = false;
  }

  selectBeneficiary(beneficiary: UserBeneficiaryResponse): void {
    // Make sure the email is defined before assigning it
    if (beneficiary.email) {
      // Create a UserBeneficiaryRequest object from the response
      const beneficiaryRequest: UserBeneficiaryRequest = {
        email: beneficiary.email,
        name: beneficiary.name || ''
      };
      
      this.emailControl.setValue(beneficiary.email);
      this.selectedBeneficiary = beneficiaryRequest;
      this.closeBeneficiarySelector();
      
      // Trigger validation
      //this.validateEmail();
    } else {
      console.error('Beneficiary email is undefined', beneficiary);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid beneficiary data'
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    
    return name[0].toUpperCase();
  }

  loadBeneficiaries(): void {
    this.beneficiaryService.getBeneficiaries().subscribe({
      error: (err) => console.error('Error loading beneficiaries:', err)
    });
  }

  fetchUserByEmail(email: string) {
    this.isLoading = true;
    this.keycloakEventsService.checkUser({
      email: email
    }).subscribe({
      next: (user) => {
        if (!user.success) {
          this.isLoading = false;
          this.isUserFound = false;
          this.emailControl.setErrors({ 'invalid': true });
          this.errorMessage = user.message as string;
          return;
        }
        this.isLoading = false;
        this.recipient = user.data;
        this.isUserFound = true;

        // Check if the sender is the receiver after the user is fetched
        this.checkIfSenderIsReceiver(email);

        // If the sender is not the receiver, clear the errors
        if (!this.isSendingToSelf) {
          this.emailControl.setErrors(null);
          this.errorMessage = '';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isUserFound = false;
        this.emailControl.setErrors({ 'invalid': true });
        console.log(err);
        this.errorMessage = err.error.message;
      }
    });
  }

  

  checkIfSenderIsReceiver(email: string) {
    if (email === this.user?.email) {
      this.errorMessage = 'You cannot send money to yourself';
      this.emailControl.setErrors({ 'invalid': true });
      this.isSendingToSelf = true;
    } else {
      this.isSendingToSelf = false;
    }
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  async setUser() {
    this.user = this.keycloakService.userInfo;
    this.wallet = await this.keycloakService.fetchUserWallet();
    this.balance = this.wallet?.balance || 0.00;

    this.amountControl = new FormControl(0.00, [
      Validators.required,
      Validators.min(1),
      this.amountExceedsBalance()
    ]);
    console.log(this.user);
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

  amountExceedsBalance(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isExceedingBalance = control.value > this.balance;
      if (isExceedingBalance) {
        this.amountControlError = 'Amount is greater than balance';
        return { exceedingBalance: { value: control.value } };
      } else {
        this.amountControlError = '';
        return null;
      }
    };
  }

  proceedToConfirmDetails() {
    if (this.emailControl.valid && this.amountControl.valid && this.narrationControl.valid) {
      const sender = this.user;
      const recipient = this.recipient
      const amount = this.amountControl.value;
      const narration = this.narrationControl.value;

      const transferState: TransferState = {
        sender: this.user,
        recipient: this.recipient,
        amount: this.amountControl.value!,
        narration: this.narrationControl.value!,
        transferId: this.transferStateService.generateTransferId()
      };

      this.transferStateService.saveTransferState(transferState);

      this.router.navigate(['/account/send-confirm'], {
        state: {
          sender,
          recipient,
          amount,
          narration
        }
      });

      this.stepsProgressService.setCurrentStep(1);
      this.currentStep = 1;

    }
  }

  /**
 * Restore form values from transfer state if available
 */
restoreFormValuesFromState(): void {
  const transferState = this.transferStateService.getTransferState();
  
  if (transferState) {
    // Only restore values if we have a valid transfer state
    if (transferState.recipient?.email) {
      this.emailControl.setValue(transferState.recipient.email);
      this.recipient = transferState.recipient;
      this.isUserFound = true;
    }
    
    // Make sure amount is handled as a number
    if (transferState.amount !== undefined && transferState.amount !== null) {
      const numAmount = typeof transferState.amount === 'string' ? 
        parseFloat(transferState.amount) : 
        transferState.amount;
        
      this.amountControl.setValue(numAmount);
      console.log("Restored amount:", numAmount);
    }
    
    if (transferState.narration) {
      this.narrationControl.setValue(transferState.narration);
    }
    
    // Validate the form after restoration
    if (transferState.recipient?.email) {
      setTimeout(() => {
        this.checkIfSenderIsReceiver(transferState.recipient!.email!);
      }, 100);
    }
  }
}

  protected readonly faSpinner = faSpinner;
  protected readonly faCheck = faCheck;
}
