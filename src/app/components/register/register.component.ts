// import {Component, OnInit} from '@angular/core';
// import { CountryControllerService} from 'src/app/services/services';
// import {Router} from "@angular/router";
// import { MessageService } from 'primeng/api';
// import {DatePipe} from "@angular/common";
// import {FormDataServiceService} from "../../services/form-data/form-data-service.service";
// import {animate, style, transition, trigger} from "@angular/animations";
// import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// import {Country} from "../../services/models/country";
//
// @Component({
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css'],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [
//         style({ opacity: 0 }),
//         animate('1.2s', style({ opacity: 1 })),
//       ]),
//     ]),
//   ]
// })
// export class RegisterComponent implements OnInit{
//
//   registrationForm: FormGroup;
//
//   step = 1;
//
//   countries: Array<Country> | undefined  = [];
//
//   minDate: Date
//   maxDate: Date
//
//   registrationRequest: {
//     firstName: string;
//     lastName: string;
//     password: string;
//     gender: 'MALE' | 'FEMALE' | 'NON_BINARY';
//     phoneNumber: string;
//     address: { addressLine1: string; city: string;  country: string; postalCode: string;  state: string };
//     dateOfBirth: string;
//     email: string
//   } = {
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     gender: 'MALE',
//     phoneNumber: '',
//     dateOfBirth: '',
//     address: {addressLine1: '', city: '',  country: '',  postalCode: '', state:'', },
//   };
//
//
//   errorMessage: Array<string> = [];
//   private finalError: string = ''
//
//   constructor(private router: Router,
//               private messageService: MessageService,
//               private datePipe: DatePipe,
//               private formDataService: FormDataServiceService,
//               private countryService: CountryControllerService,
//               private fb: FormBuilder)
//   {
//     this.registrationForm = this.fb.group({
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         Validators.pattern('(?=.*[a-z])'),
//         Validators.pattern('(?=.*[A-Z])'),
//         Validators.pattern('(?=.*[0-9])'),
//         Validators.pattern('(?=.*[!@#$%^&*])')
//       ]],
//       });
//
//     const currentDate = new Date();
//     this.registrationForm = new FormGroup({})
//     this.minDate = new Date();
//     this.minDate.setFullYear(currentDate.getFullYear() - 100);
//
//     this.maxDate = new Date();
//     this.maxDate.setFullYear(currentDate.getFullYear() - 18);
//
//   }
//
//
//   register() {
//       this.errorMessage = [];
//       this.authService.registerUser({
//         body: this.registrationRequest
//       }).subscribe({
//         next: () => {
//           this.router.navigate(['activate-account']);
//         },
//         error: (err: { error: { validationErrors: string[]; message: string; }; }) => {
//           console.log(err)
//           if (err.error.validationErrors) {
//             this.errorMessage = err.error.validationErrors
//           } else {
//             this.errorMessage.push(err.error.message);
//           }
//           const allErrors = this.errorMessage.map((msg, index) => `${index + 1}.\n${msg}\n\n`).join(' ');
//           this.finalError = this.concatenateArrayElements(this.errorMessage);
//           this.messageService.add({severity: 'error', summary: 'Error Message', detail: this.finalError});
//         }
//       });
//   }
//
//    concatenateArrayElements(arr: string[]): string {
//     return arr.map((element, index) => `${index + 1}. ${element}`).join("\n");
//   }
//
//   formatDate(date: Date): string {
//     return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
//   }
//
//   onSelect(date: Date) {
//     const formattedDate = this.formatDate(date);
//     this.registrationRequest.dateOfBirth = formattedDate;
//     console.log(formattedDate);
//   }
//
//   next() {
//     this.formDataService.updateData(this.registrationRequest);
//   }
//
//   ngOnInit(): void {
//     this.initRegistrationFormValidation();
//     this.countries = [];
//     this.countryService.getAllSupportedCountries()
//       .subscribe({
//         next: (countries  ) => {
//           this.countries = countries.data;
//           console.log(this.countries)
//        }
//       })
//   }
//
//   initRegistrationFormValidation() {
//     this.registrationForm = new FormGroup({
//       'firstName': new FormControl(null, Validators.required),
//       'lastName': new FormControl(null, Validators.required),
//       'gender': new FormControl(null, Validators.required),
//       'email': new FormControl(null, [Validators.required, Validators.email]),
//       'password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
//       'phoneNumber': new FormControl(null, [Validators.required, Validators.pattern('[- +()0-9]+')]),
//       'dateOfBirth': new FormControl(null, Validators.required),
//       'addressLine1': new FormControl(null, Validators.required),
//       'city': new FormControl(null, Validators.required),
//       'state': new FormControl(null, Validators.required),
//       'postalCode': new FormControl(null, Validators.required),
//       'country': new FormControl(null, Validators.required)
//     });
//   }
//
//   onSubmit (){
//     if (this.registrationForm.valid) {
//       const formValues = this.registrationForm.value;
//       formValues.dateOfBirth = this.formatDate(formValues.dateOfBirth);
//       this.registrationRequest.gender = formValues.gender;
//
//       this.registrationRequest.address = {
//         addressLine1: formValues.addressLine1,
//         city: formValues.city,
//         state: formValues.state,
//         postalCode: formValues.postalCode,
//         country: formValues.country
//       };
//
//       this.registrationRequest.firstName = formValues.firstName;
//       this.registrationRequest.lastName = formValues.lastName;
//       this.registrationRequest.email = formValues.email;
//       this.registrationRequest.password = formValues.password;
//       this.registrationRequest.phoneNumber = formValues.phoneNumber;
//       this.registrationRequest.dateOfBirth = formValues.dateOfBirth;
//
//       this.register()
//       console.log(this.registrationRequest);
//     }
//   }
//
// }
