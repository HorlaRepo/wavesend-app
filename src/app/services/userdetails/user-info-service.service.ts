// import { Injectable } from '@angular/core';
// import {BehaviorSubject, Observable, Subscription} from "rxjs";
// import {ApiResponseUser} from "../models/api-response-user";
// import {UserControllerService} from "../services/user-controller.service";
// import {TokenService} from "../token/token.service";
// import {User} from "../models/user";
// import {TransactionControllerService} from "../services/transaction-controller.service";
// import {ApiResponsePageTransaction} from "../models/api-response-page-transaction";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class UserInfoServiceService {
//
//   private userSubject = new BehaviorSubject<ApiResponseUser>({});
//   user$ = this.userSubject.asObservable();
//
//   constructor(private userControllerService: UserControllerService,
//               private tokenService: TokenService,
//               private transactionService: TransactionControllerService) {
//     this.fetchUser();
//   }
//
//   fetchUser() {
//     this.userControllerService.getUser({
//       id: this.getUserId()
//     })
//       .subscribe({
//         next: data => {
//           this.userSubject.next(data);
//         }
//       })
//   }
//
//   private getUserId(): number {
//     return <number>this.tokenService.getUserId();
//   }
//
//   set user(user: User | undefined){
//     localStorage.setItem('user', JSON.stringify(user));
//   }
//
//   get user(): User | undefined {
//     return JSON.parse(<string>localStorage.getItem('user'));
//   }
//
// }
