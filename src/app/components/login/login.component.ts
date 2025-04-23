import {Component, OnInit} from '@angular/core';
import { MessageService } from 'primeng/api';
import {KeycloakService} from "../../services/keycloack/keycloak.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit{

  // authRequest: AuthRequestDto = { username: '', password: '' };
  // errorMessage: Array<string> = [];
  // isLoading = false;

  constructor(
    // private router: Router,
    // private authService: AuthControllerService,
    // private tokenService: TokenService,
    // private userInfoService: UserInfoServiceService,
    // private userInactivityService: UserInactivityService,
    // private messageService: MessageService
    private keycloakService: KeycloakService
  ) {
  }

  async ngOnInit(): Promise<void> {
    // await this.keycloakService.init();
    try {
      await this.keycloakService.login();
    } catch (error) {
      // Handle the error here, e.g., show a message to the user
      console.error('Login failed:', error);
    }
  }

  // login() {
  //   this.isLoading = true;
  //   this.errorMessage = [];
  //   this.authService.authenticateAndGetToken({
  //     body: this.authRequest
  //   }).subscribe({
  //     next: (res) => {
  //       if (res && res.data){
  //         this.tokenService.token = res.data.accessToken as string;
  //         this.userInfoService.user = res.data.user;
  //         console.log(res.data)
  //         this.userInfoService.fetchUser();
  //         this.isLoading = false;
  //         this.router.navigate(['account']).then(r => {});
  //         this.userInactivityService.startTimer();
  //       }
  //     },
  //     error: err => {
  //       console.log(err)
  //       this.isLoading = false;
  //         if (err.error.validationErrors) {
  //           console.log(err.error)
  //           this.errorMessage = err.error.validationErrors
  //           this.errorMessage.forEach(msg => {
  //             this.messageService.add({severity:'error', summary: err.error.message, detail: msg});
  //           });
  //         } else {
  //           this.errorMessage.push(err.error.description);
  //           this.messageService.add({severity:'error', summary: err.error.message, detail: err.error.description});
  //         }
  //     }
  //   });
  // }
}
