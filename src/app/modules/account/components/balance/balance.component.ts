import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { UserProfile } from "../../../../services/keycloack/user-profile";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { Wallet } from "../../../../services/models/wallet";
import { AccountLimitsService } from "../../../../services/account-limits/account-limits.service";
import { Subscription, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit, OnDestroy {
  @ViewChild('limitsDialog') limitsDialogTemplate!: TemplateRef<any>;

  userProfile: UserProfile | undefined;
  userWallet: Wallet | undefined;
  isBalanceVisible: boolean = false;
  accountLimits: any = null;
  verificationLevel: string | null = null;
  loading: boolean = true;
  private dialogRef: MatDialogRef<any> | null = null;
  private readonly STORAGE_KEY = 'balance_visible';
  private subscriptions = new Subscription();

  constructor(
    private keycloakService: KeycloakService,
    private accountLimitsService: AccountLimitsService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    this.userProfile = this.keycloakService.profile;
    this.userWallet = await this.keycloakService.fetchUserWallet();
    this.loadBalanceVisibility();
    this.fetchAccountData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.closeLimitsDialog();
  }

  fetchAccountData(): void {
    this.loading = true;

    // Use forkJoin to fetch both limits and verification level in parallel
    const subscription = forkJoin({
      limits: this.accountLimitsService.fetchAccountLimits(),
      level: this.accountLimitsService.fetchVerificationLevel()
    }).subscribe({
      next: (result) => {
        this.accountLimits = result.limits;
        this.verificationLevel = result.level;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching account data:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(subscription);
  }

  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isBalanceVisible));
  }

  openLimitsDialog(): void {
    if (this.limitsDialogTemplate) {
      this.dialogRef = this.dialog.open(this.limitsDialogTemplate, {
        width: '600px',
        panelClass: 'limits-dialog-panel',
        disableClose: false,
      });
    }
  }

  closeLimitsDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  private loadBalanceVisibility(): void {
    try {
      const savedPreference = localStorage.getItem(this.STORAGE_KEY);
      // Only set to true if explicitly saved as true
      this.isBalanceVisible = savedPreference === 'true';
    } catch (error) {
      // In case of any errors with localStorage, default to hidden
      this.isBalanceVisible = false;
    }
  }

  // Keep all your existing methods
  getHiddenBalance(): string {
    return "****";
  }

  getVerificationLevelLabel(): string {
    return this.verificationLevel
      ? this.accountLimitsService.getVerificationLevelLabel(this.verificationLevel)
      : 'Loading...';
  }

  getVerificationLevelClass(): string {
    if (!this.verificationLevel) return 'badge-secondary';

    switch (this.verificationLevel) {
      case 'UNVERIFIED': return 'badge-danger';
      case 'EMAIL_VERIFIED': return 'badge-warning';
      case 'ID_VERIFIED': return 'badge-info';
      case 'FULLY_VERIFIED': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  getProgressPercentage(): number {
    if (!this.verificationLevel) return 0;

    switch (this.verificationLevel) {
      case 'UNVERIFIED': return 25;
      case 'EMAIL_VERIFIED': return 50;
      case 'ID_VERIFIED': return 75;
      case 'FULLY_VERIFIED': return 100;
      default: return 0;
    }
  }

  getLimitProgressPercentage(current: number, max: number): number {
    // If user has unlimited limits, always show full bar
    if (this.accountLimits && this.accountLimitsService.hasUnlimitedLimits(this.accountLimits)) {
      return 100;
    }

    // Handle null or zero max
    if (!max || max <= 0) return 0;

    // Normal calculation
    return Math.min(100, (current / max) * 100);
  }

  // Add new helper methods
  isUnlimited(): boolean {
    return this.accountLimits && this.accountLimitsService.hasUnlimitedLimits(this.accountLimits);
  }

  getFormattedLimit(limitType: string, formattedType: string): string {
    return this.accountLimitsService.getFormattedLimit(this.accountLimits, limitType, formattedType);
  }

  // Example for getting max transfer amount
  getMaxTransferAmount(): string {
    return this.getFormattedLimit('maxTransferAmount', 'formattedMaxTransfer');
  }

  getUpgradeMessage(): string {
    return this.verificationLevel
      ? this.accountLimitsService.getUpgradePathForLevel(this.verificationLevel)
      : 'Verify your account to increase limits';
  }

  navigateToVerification(): void {
    this.router.navigate(['/account/settings/security']);
  }
}