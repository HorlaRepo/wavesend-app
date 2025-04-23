import { AfterViewInit, Component, OnInit, ViewEncapsulation, Injectable } from '@angular/core';
import { TransactionControllerService } from "../../../../services/services/transaction-controller.service";
import { DateRangeModalComponent } from "../../components/date-range-modal/date-range-modal.component"
import { SharedService } from "../../../../services/shared/shared.service";
import { StatementService } from '../../../../services/statement/statement.service'; // Adjust path as needed
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserInfo } from "../../../../services/keycloack/user-info";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { Wallet } from "../../../../services/models/wallet";
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ScheduledTransferControllerService } from "../../../../services/services/scheduled-transfer-controller.service";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ConfirmationService } from 'primeng/api';
import { PagedTransactionResponse } from 'src/app/services/models';


declare var $: any;

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})


export class TransactionsComponent implements OnInit, AfterViewInit {

  activeTab: 'transactions' | 'scheduled' = 'transactions';
  scheduledTransfers: any[] = [];
  isLoadingScheduled = false;
  selectedScheduledTransfer: any;
  showScheduledTransferDialog: boolean = false;


  apiResponseListTransaction: PagedTransactionResponse = {};
  selectedTransaction: any;

  page = 0;
  size: number = 8;
  errorMessage: string = '';

  ranges: any = {
    'Today': [new Date(), new Date()],
    'Yesterday': [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(Date.now() - 24 * 60 * 60 * 1000)],
    'Last 7 Days': [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()],
    'Last 30 Days': [new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()],
    'This Month': [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
    'Last Month': [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
  };

  selectedDateRange: { startDate: string, endDate: string } = { startDate: '', endDate: '' };

  user: UserInfo | undefined;

  selectedFilter: string = 'All Transactions';

  wallet: Wallet | undefined;

  get walletId(): string {
    return this.wallet?.walletId as string;
  }

  get userWalletId(): number {
    return this.wallet?.id as number;
  }

  constructor(
    private transactionService: TransactionControllerService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private keycloakService: KeycloakService,
    private dialog: MatDialog,
    private statementService: StatementService,
    private messageService: MessageService,
    private scheduledTransferService: ScheduledTransferControllerService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {
  }


  async ngOnInit(): Promise<void> {
    this.user = this.keycloakService.userInfo;
    this.wallet = await this.keycloakService.fetchUserWallet();
    this.initializeDatePicker();
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'scheduled') {
        this.switchTab('scheduled');
      } else {
        this.fetchTransactions();
      }
    });
  }

  /**
   * Switch between transaction tabs
   */
  switchTab(tabName: 'transactions' | 'scheduled') {
    this.activeTab = tabName;
    if (tabName === 'transactions') {
      this.fetchTransactions();
    } else {
      this.fetchScheduledTransfers();
    }
  }

  /**
   * Fetch scheduled transfers from the API
   */
  fetchScheduledTransfers() {
    this.isLoadingScheduled = true;
    this.scheduledTransferService.getUserTransfers().subscribe({
      next: (response) => {
        // The response contains a paginated structure with content array
        if (response.data && response.data.content) {
          this.scheduledTransfers = response.data.content;
          console.log('Scheduled Transfers:', this.scheduledTransfers);
        } else {
          this.scheduledTransfers = [];
          console.warn('No scheduled transfers found or unexpected response format:', response);
        }
        this.isLoadingScheduled = false;
      },
      error: (err) => {
        this.isLoadingScheduled = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to load scheduled transfers'
        });
        console.error('Error loading scheduled transfers:', err);
      }
    });
  }


  /**
   * Cancel a scheduled transfer
   */
  cancelScheduledTransfer(transferId: number) {

    this.scheduledTransferService.cancelTransfer({ id: transferId }).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transfer cancelled successfully'
        });
        this.fetchScheduledTransfers(); // Refresh the list
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to cancel transfer'
        });
      }
    });

  }


  /**
   * Get human-readable frequency text
   */
  getFrequencyText(frequency: string): string {
    if (!frequency) return 'One-time';

    const frequencyMap: { [key: string]: string } = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'BIWEEKLY': 'Every 2 weeks',
      'MONTHLY': 'Monthly'
    };

    return frequencyMap[frequency] || frequency;
  }



  formatDateTime(dateValue: any): string {
    if (Array.isArray(dateValue)) {
      // Handle array format [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour, minute, second] = dateValue;
      // JavaScript months are 0-based, so subtract 1 from the month
      return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
    } else if (typeof dateValue === 'string') {
      // Handle string format
      return new Date(dateValue).toLocaleString();
    }
    return 'Invalid date';
  }


  showCancelConfirmation(transferId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this scheduled transfer?',
      accept: () => {
        this.cancelScheduledTransfer(transferId);
      }
    });
  }



  /**
   * View details of a scheduled transfer in a modal
   */
  viewScheduledTransfer(transfer: any) {
    this.selectedScheduledTransfer = transfer;
    this.showScheduledTransferDialog = true; // This will show the PrimeNG dialog
  }

  /**
   * Format status for display
   */
  formatStatus(status: string): string {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }


  fetchTransactions() {
    this.transactionService.getTransactionsByWallet({
      walletId: this.walletId,
      page: this.page,
      size: this.size
    }).subscribe({
      next: data => {
        this.apiResponseListTransaction = data.data!;
        console.log(data);
        this.sharedService.updateTransactionsData(data.data!);
      }
    })
  }


  initializeDatePicker(): void {
    $(function () {
      $("#dateRange").datepicker();
    });
  }


  gotoFirstPage() {
    this.page = 0;
    this.fetchTransactions();
  }

  gotoPreviousPage() {
    this.page--;
    this.fetchTransactions();
  }

  gotoNextPage() {
    this.page++;
    this.fetchTransactions();
  }

  gotoLastPage() {
    this.page = this.apiResponseListTransaction.totalPages as number - 1;
    this.fetchTransactions();
  }

  gotoPage(index: number) {
    this.page = index;
    this.fetchTransactions();
  }

  get isLastPage(): boolean {
    return this.page == this.apiResponseListTransaction.totalPages as number - 1;
  }

  ngAfterViewInit(): void {

  }

  selectTransaction(transaction: any) {
    this.selectedTransaction = transaction;
    console.log(transaction);
  }

  getTransactionsBetweenDates(startDate: string, endDate: string) {
    this.transactionService.getUserTransactionsBetweenDates({
      walletId: this.walletId,
      startDate: startDate,
      endDate: endDate,
      size: this.size,
      page: this.page
    }).subscribe({
      next: data => {
        this.apiResponseListTransaction = data.data!;
        this.cdr.detectChanges();
        console.log(data);
      }
    })
  }

  getTransactionsByFilter(filter: string, startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      console.log(startDate, endDate);
      this.transactionService.getTransactionsByFilter({
        walletId: this.userWalletId,
        filter: filter,
        size: this.size,
        page: this.page
      }).subscribe({
        next: data => {
          this.apiResponseListTransaction = data.data!;
          this.cdr.detectChanges();
          console.log(data);
        }
      })
    } else {
      this.transactionService.getTransactionsByFilter({
        walletId: this.userWalletId,
        filter: filter,
        startDate: startDate,
        endDate: endDate,
        size: this.size,
        page: this.page
      }).subscribe({
        next: data => {
          this.apiResponseListTransaction = data.data!;
          this.cdr.detectChanges();
          console.log(data);
        }
      })
    }
  }

  onDatesUpdated(event: any) {
    let startDate = new Date(event.startDate);
    let endDate = new Date(event.endDate);

    // Do not set the end time to 23:59:59 to avoid including the next day
    // endDate.setHours(23, 59, 59);

    const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    const formattedEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');

    console.log(`Start Date: ${formattedStartDate}, End Date: ${formattedEndDate}`)

    this.selectedDateRange = { startDate: formattedStartDate!, endDate: formattedEndDate! };

    console.log(`Start Date: ${formattedStartDate}, End Date: ${formattedEndDate}`);
    this.cdr.detectChanges();

    this.filterTransactions();
  }


  filterTransactions() {
    console.log(this.selectedFilter);
    if (this.selectedFilter === 'All Transactions') {
      if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
        this.getTransactionsBetweenDates(this.selectedDateRange.startDate, this.selectedDateRange.endDate);
      } else {
        this.fetchTransactions();
      }
    } else {
      this.getTransactionsByFilter(this.selectedFilter, this.selectedDateRange.startDate, this.selectedDateRange.endDate);
    }
  }

  openDateModal(format: string): void {
    const dialogRef = this.dialog.open(DateRangeModalComponent, {
      width: '400px',
      data: { format }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.downloadStatement(result.fromDate, result.toDate, result.format);
      }
    });
  }


  downloadStatement(start: string, end: string, format: string) {
    this.statementService.generateStatement(start, end, format).subscribe({
      next: (blob: Blob) => {
        const fileName = `statement${start}-${end}.${format.toLowerCase()}`;
        saveAs(blob, fileName);
        this.errorMessage = "";
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) {
          this.errorMessage = this.errorMessage || 'An error occurred while generating the statement.';
          this.showErrorMessage(this.errorMessage);
        } else {
          this.errorMessage = 'An unexpected error occurred.';
          this.showErrorMessage(this.errorMessage);
        }
      }
    });
  }

  showErrorMessage(error: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
  }

  // Add this method to your TransactionsComponent class:

  getDisplayedPages(): number[] {
    if (!this.apiResponseListTransaction?.totalPages) {
      return [];
    }

    const totalPages = this.apiResponseListTransaction.totalPages;
    // If 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const currentPage = this.page;
    // Always include first and last page
    const result: number[] = [];

    // First page
    result.push(0);

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      result.push(-1); // -1 represents ellipsis
    }

    // Pages around current page
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages - 2, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 4) {
      result.push(-1); // -1 represents ellipsis
    }

    // Last page
    result.push(totalPages - 1);

    return result;
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
