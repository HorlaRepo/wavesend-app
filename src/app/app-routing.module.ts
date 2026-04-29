import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './services/authguard/auth-guard.service';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

const routes: Routes = [
  // Redirect the root to account
  { path: '', redirectTo: 'account', pathMatch: 'full' },

  // Login route
  { path: 'login', component: LoginComponent },

  // Register route
  { path: 'register', component: RegisterComponent },

  // Forgot password route
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // All account routes require authentication
  {
    path: 'account',
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
    canActivate: [authGuard]
  },

  // Catch all other routes and redirect to login
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
