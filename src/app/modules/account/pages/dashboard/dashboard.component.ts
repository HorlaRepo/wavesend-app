import {Component, OnDestroy, OnInit} from '@angular/core';
import {TransactionControllerService} from "../../../../services/services/transaction-controller.service";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {UserInfo} from "../../../../services/keycloack/user-info";
import {WalletControllerService} from "../../../../services/services/wallet-controller.service";
import {Wallet} from "../../../../services/models/wallet";
import { SuggestionStateService } from 'src/app/services/ai/suggestion-state.service';
import { BeneficiaryAiSuggestion } from 'src/app/services/models/beneficiary-ai-suggestion';
import { PagedTransactionResponse } from 'src/app/services/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  user: UserInfo | undefined;
  apiResponseListTransaction: PagedTransactionResponse | null = {};
  wallet: Wallet | undefined;

  selectedTransaction: any;
  page = 0;
  size: number = 7;
  showSuggestions = false;

  constructor(private transactionService: TransactionControllerService,
              private keycloakService: KeycloakService,
            private suggestionsService: SuggestionStateService) {
  }

   async ngOnInit(): Promise<void> {
      this.user = this.keycloakService.userInfo
      this.wallet = await this.keycloakService.fetchUserWallet();
      this.fetchTransactions();
      this.checkForSuggestions();
  }

  checkForSuggestions() {
    this.suggestionsService.checkForSuggestions().subscribe();
  }


  handleSuggestionAction(event: {action: string, suggestion: BeneficiaryAiSuggestion}) {
    console.log(`Suggestion action: ${event.action}`, event.suggestion);
    // You can handle additional logic here if needed
  }

  get walletId(): string {
    return this.wallet?.walletId as string;
  }

  fetchTransactions(){
    this.transactionService.getTransactionsByWallet({
      walletId: this.walletId,
      page: this.page,
      size: this.size
    }).subscribe({
      next: data => {
        this.apiResponseListTransaction = data.data!;
        console.log(data);
      }, error: err => {
        console.error(err.error);
      }
    })
  }


  ngOnDestroy(): void {
    // if (this.transactionsDataSubscription) {
    //   this.transactionsDataSubscription.unsubscribe();
    // }
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.fetchTransactions();
  }

  selectTransaction(transaction: any) {
    this.selectedTransaction = transaction;
    console.log(transaction);
  }

  formatTransactionDate(dateString: string | null | undefined): { day: string, month: string } {
    if (!dateString) {
      return { day: '--', month: '---' };
    }

    try {
      let date: Date;

      // Handle standard ISO format
      if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
        date = new Date(dateString);
      }
      // Handle "yyyy-MM-dd HH:mm:ss" format
      else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hours, minutes, seconds);
      }
      // Try standard date parsing
      else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return { day: '--', month: '---' };
      }

      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];

      return { day, month };
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return { day: '--', month: '---' };
    }
  }

  formatDetailDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format date as "22 October 2025 at 2:45pm"
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      // Format time as "2:45pm"
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year} at ${hours}:${minutes}${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  }
}
