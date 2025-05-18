import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CountryControllerService } from "../../../../services/services/country-controller.service";
import { FlutterwaveControllerService } from "../../../../services/services/flutterwave-controller.service";
import { Bank } from "../../../../services/models/bank";
import { CardControllerService } from "../../../../services/services/card-controller.service";
import { Card } from "../../../../services/models/card";
import { MessageService } from 'primeng/api';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PayStackControllerService } from "../../../../services/services/pay-stack-controller.service";
import { BankAccountControllerService } from "../../../../services/services/bank-account-controller.service";
import { BankAccount } from "../../../../services/models/bank-account";
import { UserInfo } from "../../../../services/keycloack/user-info";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { Wallet } from "../../../../services/models/wallet";
import { PaymentMethodsControllerService } from "../../../../services/services/payment-methods-controller.service";
import { PaymentMethod } from "../../../../services/models/payment-method";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { FormConfigurations } from "../../config/form-configurations.interface";
import { MobileMoneyOption } from "../../../../services/models/mobile-money-option";
import { Country } from "../../../../services/models/country";
import { debounceTime } from "rxjs";
import { Dropdown } from 'primeng/dropdown';


declare var $: any;
declare var bootstrap: any;
type RegionEnum = 'AFRICA' | 'EU' | 'US';

@Component({
  selector: 'app-settings-payment-methods',
  templateUrl: './settings-payment-methods.component.html',
  styleUrls: ['./settings-payment-methods.component.css'],
  providers: [MessageService]
})
export class SettingsPaymentMethodsComponent implements OnInit {

  user: UserInfo | undefined;
  country: Country | undefined = {};
  banks: Array<Bank> | undefined = [];
  paymentMethods: Array<PaymentMethod> | undefined;
  mobileMoneyOptions: Array<MobileMoneyOption> | undefined;
  selectedPaymentMethod = '';
  bankCode: string = '';
  cards: Array<Card> | undefined = [];
  selectedCard: Card | undefined;
  createPin: string = '';
  confirmPin: string = '';
  enterPin: string = '';
  cardType: string = '';
  isPinCreationSuccessful = false;
  isCardPinValidated = false;
  isLoading = false;
  displayActivateDialog: boolean = false;
  displayVerifyDialog: boolean = false;
  displayCardInfo: boolean = false;
  requestNewCard: boolean = false;
  addBankAccount: boolean = false;
  wallet: Wallet | undefined;
  accountNumber: string = '';
  accountName: string = '';
  bankName: string = '';
  accountType: string = 'personal';
  currency: string = '';

  selectedBankAccount: BankAccount | undefined;

  isAccountValid = false;
  isConfirmed = false;
  isLoadingBanksList = false;

  addBankAccountForm!: FormGroup;
  currentBankOptions: Array<Bank | MobileMoneyOption> = [];
  validationErrors: string[] = [];


  formConfigurations: FormConfigurations = {
    Africa: [
      { name: 'paymentMethod', type: 'select', label: 'Payment Method', optionsSource: 'paymentMethods' },
      { name: 'bankName', type: 'select', label: 'Bank Name', optionsSource: 'banks' },
      { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
      { name: 'bankCode', type: 'text', label: 'Bank Code' },
      { name: 'accountName', type: 'text', label: 'Account Name' },
      { name: 'isConfirmed', type: 'checkbox', label: 'I confirm the bank account details above' }
    ],
    US: [
      { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
      { name: 'routingNumber', type: 'text', label: 'Routing Number' },
      { name: 'swiftCode', type: 'text', label: 'Swift Code' },
      { name: 'bankName', type: 'select', label: 'Bank Name', optionsSource: 'banks' },
      { name: 'beneficiaryName', type: 'text', label: 'Beneficiary Name' },
      { name: 'beneficiaryAddress', type: 'text', label: 'Beneficiary Address' },
      { name: 'isConfirmed', type: 'checkbox', label: 'I confirm the bank account details above' }
    ],
    EU: [
      { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
      { name: 'routingNumber', type: 'text', label: 'Routing Number' },
      { name: 'swiftCode', type: 'text', label: 'Swift Code' },
      { name: 'bankName', type: 'text', label: 'Bank Name' },
      { name: 'beneficiaryName', type: 'text', label: 'Beneficiary Name' },
      { name: 'beneficiaryCountry', type: 'text', label: 'Beneficiary Country' },
      { name: 'postalCode', type: 'text', label: 'Postal Code' },
      { name: 'streetNumber', type: 'text', label: 'Street Number' },
      { name: 'streetName', type: 'text', label: 'Street Name' },
      { name: 'city', type: 'text', label: 'City' },
      { name: 'isConfirmed', type: 'checkbox', label: 'I confirm the bank account details above' }
    ]
  };

  banksList: Array<BankAccount> | undefined = [];



  constructor(private flutterwaveService: FlutterwaveControllerService,
    private countryService: CountryControllerService,
    private cardService: CardControllerService,
    private messageService: MessageService,
    private modalService: NgbModal,
    private payStackService: PayStackControllerService,
    private bankAccountService: BankAccountControllerService,
    private keycloakService: KeycloakService,
    private paymentMethodsService: PaymentMethodsControllerService,
    private fb: FormBuilder) {

    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    this.user = this.keycloakService.userInfo
    this.wallet = await this.keycloakService.fetchUserWallet();
    await this.getCountry();
    this.fetchCards();
    this.fetchBankList();
  }


  initializeForm() {
    let currentConfig: Array<any> = [];

    this.addBankAccountForm = this.fb.group({
      accountType: ['personal', Validators.required],
      countryName: [this.country?.name],
      currency: [this.currency],
      region: [this.country?.region],
    });

    this.addBankAccountForm.valueChanges.subscribe(() => {
      if (this.validationErrors.length > 0) {
        // Clear global validation errors when user makes changes
        this.validationErrors = [];
      }
    });

    if (this.country?.region) {
      currentConfig = this.formConfigurations[this.country.region];
    } else {
      console.error("Country region is undefined.");
      return;
    }

    if (!currentConfig) {
      console.error(`No form configuration found for region: ${this.country.region}`);
      return;
    }

    currentConfig.forEach(field => {
      const control = this.fb.control({ value: '', disabled: field.disabled || false },
        Validators.required);
      this.addBankAccountForm.addControl(field.name, control);
    });

    this.addBankAccountForm.get('isConfirmed')?.valueChanges.subscribe(value => {
      this.isConfirmed = value;
    });

    // Handle paymentMethod change
    this.addBankAccountForm.get('paymentMethod')?.valueChanges.subscribe(async value => {
      switch (value) {
        case 'Mobile Money':
          await this.fetchCountryMobileMoneyOptions(this.country?.acronym as string);
          break;
        case 'Bank Account':
          // Only load bank options if region is Africa
          if (this.isAfricanRegion()) {
            this.loadBanks();
          }
          break;
        case 'USD (NG DOM Account)':
          if (this.isAfricanRegion()) {
            this.loadBanks();
          }
          break;
        default:
          break;
      }
    });

    if (this.country.region === 'Africa') {
      this.addBankAccountForm.get('bankCode')?.disable();
      if (this.country.name === 'Nigeria') {
        this.addBankAccountForm.get('accountName')?.disable();
        this.addBankAccountForm.get('accountNumber')?.valueChanges
          .pipe(debounceTime(2000))
          .subscribe(value => {
            this.accountNumber = value;
            this.validateAccount();
          });
      }

      this.addBankAccountForm.get('bankName')?.valueChanges.subscribe(value => {
        this.bankName = value;
        const selectedBank = this.banks?.find(bank => bank.name === this.bankName);
        if (this.addBankAccountForm.get('paymentMethod')?.value === 'Mobile Money') {
          this.bankCode = this.bankName;
        } else {
          this.bankCode = selectedBank?.code || '';
        }
        this.addBankAccountForm.get('bankCode')?.setValue(this.bankCode);
      });
    }

    // Initial load based on the current payment method
    const paymentMethod = this.addBankAccountForm.get('paymentMethod')?.value;
    if (paymentMethod === 'Mobile Money') {
      this.fetchCountryMobileMoneyOptions(this.country?.acronym as string).then(r => { });
    } else if (paymentMethod === 'Bank Account' || paymentMethod === 'USD (NG DOM Account)') {
      this.loadBanks();
    }
  }


  getCountry(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.countryService.getCountryByName({
        countryName: this.user?.address?.country as string
      }).subscribe({
        next: data => {
          console.log(data.data);
          this.country = data.data;
          this.currency = this.country?.currency as string;
          //this.loadBanks();
          this.fetchCountryPaymentMethods();
          this.initializeForm();
          resolve();
        },
        error: err => {
          console.error(err.error);
          reject(err);
        }
      });
    });
  }

  isAfricanRegion(): boolean {
    return this.country?.region?.toLowerCase() === 'africa';
  }

  loadBanks(): void {
    // Only load banks for dropdown if region is Africa
    if (!this.isAfricanRegion()) {
      this.isLoadingBanksList = false;
      return;
    }

    this.isLoadingBanksList = true;
    this.flutterwaveService.getBanks({
      country: this.country?.acronym as string
    }).subscribe({
      next: response => {
        this.banks = response.data || [];
        if (this.addBankAccountForm.get('paymentMethod')?.value !== 'Mobile Money') {
          this.currentBankOptions = this.banks || [];
        }
        this.isLoadingBanksList = false;
      }, error: err => {
        console.error('Error loading banks:', err);
        this.isLoadingBanksList = false;
        this.showAlert('error', 'Error', 'Failed to load banks');
      }
    });
  }

  onBankChange(event: any) {
    if (this.isAfricanRegion()) {
      // Dropdown change event handling (for Africa)
      const selectedBankName = typeof event === 'string' ? event : event.value;
      this.bankName = selectedBankName;
      const selectedBank = this.banks?.find(bank => bank.name === this.bankName);
      this.bankCode = selectedBank?.code || '';
    } else {
      // Text input change event handling (for EU and US)
      this.bankName = event.target.value;
      // No bank code logic for non-African regions
    }

    // If you have a bankCode formControl, update it
    if (this.addBankAccountForm.get('bankCode')) {
      this.addBankAccountForm.get('bankCode')?.setValue(this.bankCode);
    }
  }



  fetchCards() {
    this.cardService.findCardByWalletId({
      walletId: this.wallet?.id as number
    }).subscribe({
      next: data => {
        this.cards = data.data;
        console.log(data);
      }, error: err => {
        console.error(err.error);
      }
    })
  }

  generateCard() {
    this.isLoading = true;
    console.log(this.cardType)
    console.log(this.user?.email)
    this.cardService.generateCard({
      body: {
        cardType: this.cardType,
        walletId: this.wallet?.id as number,
        userEmail: this.user?.email as string
      }
    }).subscribe({
      next: data => {
        this.isLoading = false;
        this.fetchCards();
        this.showAlert('success', 'Success', data.message as string);
      }, error: err => {
        this.isLoading = false;
        this.showAlert('error', 'Error', err.error.message);
        console.error(err.error);
      }
    })
  }

  createCardPin() {
    if (this.createPin === this.confirmPin) {
      this.isLoading = true;
      this.cardService.setCardPin({
        id: this.selectedCard?.id!,
        body: {
          pin: this.createPin
        }
      }).subscribe({
        next: data => {
          if (data.success) {
            this.isPinCreationSuccessful = true;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: data.message });
            this.fetchCards()
            this.hideDialog();
          }
          this.isLoading = false;
        }, error: err => {
          console.error(err.error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.validationErrors });
          this.isLoading = false;
        }
      })
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Pin does not match' });
    }
  }

  validateCardPin() {
    this.isLoading = true;
    this.cardService.verifyPin({
      cardId: this.selectedCard?.id!,
      body: {
        pin: this.enterPin
      }
    }).subscribe({
      next: data => {
        this.isLoading = false;
        if (data) {
          this.isCardPinValidated = true;

          // Don't close the verification dialog until we're sure the next one will open
          // Just hide it visually first
          const verifyDialog = document.querySelector('.p-dialog') as HTMLElement;
          if (verifyDialog) {
            verifyDialog.style.opacity = '0';
            verifyDialog.style.pointerEvents = 'none';
          }

          // Use a longer timeout to ensure clean transition
          setTimeout(() => {
            this.displayVerifyDialog = false;
            // Force a new cycle before showing the new dialog
            setTimeout(() => {
              this.displayCardInfo = true;
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'PIN verified successfully' });
            }, 100);
          }, 300);
        }
      },
      error: err => {
        this.isLoading = false;
        this.showAlert('error', 'Error', err.error.message);
        console.error(err.error);
      }
    })
  }

  validateAccount() {
    this.isLoading = true;
    this.payStackService.resolveBankAccount({
      account_number: this.accountNumber,
      bank_code: this.bankCode
    }).subscribe({
      next: data => {
        if (data.status) {
          this.isLoading = false;
          this.isAccountValid = true;
          this.accountName = data.data?.account_name as string;
          this.addBankAccountForm.get('accountName')?.setValue(this.accountName);
          this.showAlert('success', 'Success', data.message as string);
        } else {
          this.isLoading = false;
          this.isAccountValid = false;
          this.accountName = '';
          this.showAlert('error', 'Error', data.message as string);
        }
      }, error: err => {
        this.isLoading = false;
        this.isAccountValid = false;
        this.accountName = '';
        this.showAlert('error', 'Error', err.error.message);
        console.error(err.error);
      }
    })
  }

  fetchCountryPaymentMethods() {
    this.paymentMethodsService.getPaymentMethodsByCountryAcronym({
      countryAcronym: this.country?.acronym as string
    }).subscribe({
      next: data => {
        this.paymentMethods = data.data;
        console.log(data);
      }, error: err => {
        console.error(err.error);
      }
    })
  }

  fetchCountryMobileMoneyOptions(acronym: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.countryService.getAllMobileMoneyOptions({ acronym: acronym })
        .subscribe({
          next: data => {
            console.log(data.data);
            this.mobileMoneyOptions = data.data || [];
            if (this.addBankAccountForm.get('paymentMethod')?.value === 'Mobile Money') {
              this.currentBankOptions = this.mobileMoneyOptions || [];
            }
            resolve();
          },
          error: err => {
            console.error(err.error);
            reject(err);
          }
        });
    });
  }

  addBankAccountDetails() {
    if (this.addBankAccountForm.invalid) {
      return;
    }

    // Clear any previous validation errors
    this.validationErrors = [];
    this.isLoading = true;

    const formData = this.addBankAccountForm.getRawValue();
    delete formData.isConfirmed;

    const payload: any = {
      accountType: formData.accountType,
    };

    if (this.country?.region === 'EU') {
      // Build the address using all available address components
      const addressParts = [];

      // Add street address
      if (formData.streetNumber || formData.streetName) {
        const streetAddress = `${formData.streetNumber || ''} ${formData.streetName || ''}`.trim();
        if (streetAddress) addressParts.push(streetAddress);
      }

      // Add city
      if (formData.city) addressParts.push(formData.city);

      // Add postal code
      if (formData.postalCode) addressParts.push(formData.postalCode);

      // Add country
      if (formData.beneficiaryCountry) addressParts.push(formData.beneficiaryCountry);

      // Join all parts with commas
      const fullAddress = addressParts.join(', ');

      // Set the beneficiaryAddress in the form data object
      formData.beneficiaryAddress = fullAddress;

      payload.beneficiaryAddress = fullAddress;


    }

    this.formConfigurations[this.country?.region!].forEach(field => {
      if (formData[field.name] !== undefined) {
        payload[field.name] = formData[field.name];
      }
    });
    payload['bankCountry'] = this.country?.name;
    payload['currency'] = this.currency;

    this.bankAccountService.addBankAccount({
      body: {
        bankAccountDetails: payload,
        region: this.getRegionEnum(this.country?.region as string)
      }
    }).subscribe({
      next: data => {
        if (data.success) {
          this.isLoading = false;
          this.showAlert('success', 'Success', data.message as string);
          this.fetchBankList();
          this.hideDialog();
        } else {
          this.isLoading = false;
          this.showAlert('error', 'Error', data.message as string);
          this.fetchBankList();
        }
      },
      error: err => {
        this.isLoading = false;

        // Handle validation errors specifically
        if (err.error && err.error.validationErrors && Array.isArray(err.error.validationErrors)) {
          this.validationErrors = err.error.validationErrors;
          // Highlight fields with validation errors
          this.highlightInvalidFields(this.validationErrors);
        } else {
          // Fallback for other types of errors
          this.showAlert('error', 'Error', err.error?.message || 'An error occurred');
        }

        console.error('Error adding bank account:', err.error);
      }
    });
  }

  fetchBankList() {
    this.bankAccountService.getBankAccountsByUser().subscribe({
      next: data => {
        this.banksList = data.data;
        console.log(data);
      }, error: err => {
        console.error(err.error);
      }
    })
  }

  viewBankAccount(bankAccount: BankAccount): void {
    this.selectedBankAccount = bankAccount;
    $('#bank-account-details').modal('show');
  }

  formatCardNumber(cardNumber: string | undefined): string {
    if (!cardNumber) return 'XXXX-XXXX-XXXX-0000';

    const lastFourDigits = cardNumber.slice(-4);
    return 'XXXX-XXXX-XXXX-' + lastFourDigits;
  }

  viewCard(card: Card): void {
    this.selectedCard = card;
    console.log("Selected card:", card);
    this.showDialog(card);
  }

  numericOnly(event: KeyboardEvent): boolean {
    const char = event.key;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      return true;
    }
    return !isNaN(Number(char));
  }

  open(content: any) {
    this.modalService.open(content);
  }

  showAlert(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  onVerifyDialogHide() {
    // Only reset PIN and clear validation if we're not showing the card info
    if (!this.displayCardInfo) {
      this.enterPin = '';
      this.isCardPinValidated = false;
    }
  }

  showCardInfoDialog() {
    // Make sure all other dialogs are closed first
    this.displayActivateDialog = false;
    this.displayVerifyDialog = false;

    // Force a fresh render cycle before opening the new dialog
    setTimeout(() => {
      this.displayCardInfo = true;
    }, 50);
  }

  showDialog(card: Card) {
    // Reset all dialogs first to avoid conflicts
    this.displayActivateDialog = false;
    this.displayVerifyDialog = false;
    this.displayCardInfo = false;

    // Small timeout before showing the new dialog
    setTimeout(() => {
      if (card.locked) {
        this.displayActivateDialog = true;
      } else {
        this.displayVerifyDialog = true;
      }
    }, 50);
  }

  hideDialog(fromCardInfo: boolean = false) {
    this.validationErrors = [];
    if (this.displayCardInfo && !fromCardInfo) {
      this.displayCardInfo = false;
      this.isCardPinValidated = false;
      this.enterPin = '';
    } else if (this.displayVerifyDialog) {
      const isTransitioningToCardInfo = this.isCardPinValidated;
      this.displayVerifyDialog = false;

      // Only reset if not going to card info dialog
      if (!isTransitioningToCardInfo) {
        this.enterPin = '';
        this.isCardPinValidated = false;
      }
    } else if (this.displayActivateDialog) {
      this.displayActivateDialog = false;
      this.createPin = '';
      this.confirmPin = '';
    } else {
      this.requestNewCard = false;
      this.addBankAccount = false;
    }
  }

  showCardRequestDialog() {
    this.requestNewCard = true;
  }

  showAddBankAccountDialog() {
    this.addBankAccount = true;
  }

  formatAccountNumber(accountNumber: string | undefined): string {
    const lastFourDigits = accountNumber?.slice(-4);
    return `XXX-${lastFourDigits}`;
  }
  formatAccountNumberFn(accountNumber: string | undefined): string {
    const lastFourDigits = accountNumber?.slice(-4);
    const maskedPrefix = 'X'.repeat(accountNumber?.length! - 4);
    return `${maskedPrefix}-${lastFourDigits}`;
  }

  onCountryChange(event: any) {
    console.log('Selected country:', event.target.value);
  }

  getRegionEnum(region: string | undefined): RegionEnum {

    const upperRegion = region?.toUpperCase();

    if (upperRegion === 'AFRICA' || region === 'Africa') {
      return 'AFRICA';
    } else if (upperRegion === 'EU') {
      return 'EU';
    } else if (upperRegion === 'US') {
      return 'US';
    }

    console.warn(`Invalid region: ${region}. Using default value 'AFRICA'`);
    return 'AFRICA';
  }

  highlightInvalidFields(errors: string[]) {
    // Reset all fields first
    Object.keys(this.addBankAccountForm.controls).forEach(key => {
      const control = this.addBankAccountForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    // Set errors on fields mentioned in validation errors
    errors.forEach(error => {
      // Extract field name from error message
      const fieldMatch = error.match(/^(\w+)/);
      if (fieldMatch && fieldMatch[1]) {
        const fieldName = fieldMatch[1].toLowerCase();
        const control = this.addBankAccountForm.get(fieldName);

        if (control) {
          control.setErrors({ serverError: error });
          control.markAsTouched();
        }
      }
    });
  }
}


