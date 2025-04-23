import {Component, OnInit} from '@angular/core';
import {UserProfile} from "../../../../services/keycloack/user-profile";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {Wallet} from "../../../../services/models/wallet";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit{

  userProfile: UserProfile | undefined;
  userWallet: Wallet | undefined;
  isBalanceVisible: boolean = false;
  private readonly STORAGE_KEY = 'balance_visible';

  constructor(private keycloakService: KeycloakService) {
  }

  async ngOnInit(): Promise<void> {
    this.userProfile = this.keycloakService.profile;
    this.userWallet = await this.keycloakService.fetchUserWallet();

    this.loadBalanceVisibility();
  }

  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isBalanceVisible));
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

  getHiddenBalance(): string {
    return "****";
  }
}
