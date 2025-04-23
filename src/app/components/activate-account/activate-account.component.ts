// import { Component } from '@angular/core';
// import {Router} from "@angular/router";
//
// @Component({
//   selector: 'app-activate-account',
//   templateUrl: './activate-account.component.html',
//   styleUrls: ['./activate-account.component.css']
// })
// export class ActivateAccountComponent {
//
//   message = '';
//   isOkay = true;
//   submitted = false;
//
//   constructor(
//     private router: Router,
//     private authService: AuthControllerService,
//   ) {
//   }
//
//   onCodeCompleted(token: string) {
//     this.confirmAccount(token);
//   }
//
//   navigateToLogin() {
//     this.router.navigate(['login']);
//   }
//
//   private confirmAccount(token: string) {
//     this.authService.activateAccount({
//       token: token
//     }).subscribe({
//       next: () => {
//         this.message = 'Account activated successfully';
//         this.isOkay = true;
//         this.submitted = true;
//       },
//       error: err => {
//         this.message = 'Invalid token provided. Please try again.'
//         this.isOkay = false;
//         this.submitted = true;
//       }
//     })
//   }
// }
