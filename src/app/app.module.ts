import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { InputMaskModule } from 'primeng/inputmask';
import { AppRoutingModule } from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { FeesComponent } from './components/fees/fees.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { HelpComponent } from './components/help/help.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import {ToastModule} from "primeng/toast";
import { MessageService } from 'primeng/api';
import {CodeInputModule} from "angular-code-input";
import { DatePipe} from "@angular/common";
import {HttpTokenInterceptor} from "./services/interceptor/http-token.interceptor";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {KeycloakService} from "./services/keycloack/keycloak.service";
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { LocalDateTimePipe } from './pipes/local-date-time.pipe';
import { environment } from '../environments/environment';
import { AccountModule } from './modules/account/account.module';
import { AppConfigService } from './services/production/app-config.service';


export function kcFactory(kc: KeycloakService) {
  return () => {
    console.log('APP_INITIALIZER: Starting Keycloak initialization');
    return kc.init()
      .then(result => {
        console.log('APP_INITIALIZER: Keycloak initialization result:', result);
        return result;
      })
      .catch(error => {
        console.error('APP_INITIALIZER: Keycloak initialization error:', error);
        return false;
      });
  };
  //return () => kc.init();
}

export function initializeApp(appConfigService: AppConfigService) {
  return () => appConfigService.loadConfig();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    AboutComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent,
    DashboardHeaderComponent,
    FeesComponent,
    ContactUsComponent,
    HelpComponent,
    NotFoundComponent,
    LocalDateTimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatMenuModule,
    BrowserAnimationsModule,
    CalendarModule,
    NgOptimizedImage,
    MessagesModule,
    InputMaskModule,
    ToastModule,
    CodeInputModule,
    FontAwesomeModule,
    TabViewModule,
    DialogModule,
    AccountModule
  ],
  providers: [
    HttpClient,
    MessageService,
    { provide: 'BASE_PATH', useValue: environment.apiUrl },

    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpTokenInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true
    },

    {
      provide: APP_INITIALIZER,
      deps: [KeycloakService],
      useFactory: kcFactory,
      multi: true
    },
    LocalDateTimePipe
  ],
  exports: [
    DashboardHeaderComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
