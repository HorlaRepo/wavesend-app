import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './services/authguard/auth-guard.service';

const routes: Routes = [
  // Redirect the root to account
  { path: '', redirectTo: 'account', pathMatch: 'full' },
  
  // Handle authentication callback
  { path: 'callback', redirectTo: 'account', pathMatch: 'full' },
  
  // All routes require authentication
  { 
    path: 'account',
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
    canActivate: [authGuard] 
  },
  
  // Catch all other routes and redirect to account
  { path: '**', redirectTo: 'account' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    useHash: false,
    // Add these options to help with routing issues
    onSameUrlNavigation: 'reload',  
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }