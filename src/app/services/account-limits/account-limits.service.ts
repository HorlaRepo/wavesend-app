import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AccountLimitControllerService } from '../services/account-limit-controller.service';
import { ApiResponseAccountLimitDto } from '../models/api-response-account-limit-dto';
import { ApiResponseVerificationLevel } from '../models/api-response-verification-level';

@Injectable({
  providedIn: 'root'
})
export class AccountLimitsService {
  private accountLimitsSubject = new BehaviorSubject<any>(null);
  private verificationLevelSubject = new BehaviorSubject<string | null>(null);
  
  public accountLimits$ = this.accountLimitsSubject.asObservable();
  public verificationLevel$ = this.verificationLevelSubject.asObservable();
  
  constructor(private accountLimitController: AccountLimitControllerService) {}
  
  fetchAccountLimits(): Observable<any> {
    return this.accountLimitController.getMyAccountLimits().pipe(
      map(response => response.data),
      tap(limits => {
        if (limits) {
          this.accountLimitsSubject.next(limits);
        }
      })
    );
  }
  
  fetchVerificationLevel(): Observable<string | null> {
    return this.accountLimitController.getMyVerificationLevel().pipe(
      map(response => response.data || null),
      tap(level => {
        if (level) {
          this.verificationLevelSubject.next(level);
        }
      })
    );
  }
  
  getVerificationLevelLabel(level: string): string {
    switch(level) {
      case 'UNVERIFIED':
        return 'Unverified';
      case 'EMAIL_VERIFIED':
        return 'Email Verified';
      case 'ID_VERIFIED':
        return 'ID Verified';
      case 'FULLY_VERIFIED':
        return 'Fully Verified';
      default:
        return 'Unknown';
    }
  }
  
  getUpgradePathForLevel(level: string): string {
    switch(level) {
      case 'UNVERIFIED':
        return 'Verify your email to increase limits';
      case 'EMAIL_VERIFIED':
        return 'Verify your ID to increase limits';
      case 'ID_VERIFIED':
        return 'Complete address verification to maximize limits';
      case 'FULLY_VERIFIED':
        return 'You have the highest account limits';
      default:
        return 'Upgrade your account to increase limits';
    }
  }
}