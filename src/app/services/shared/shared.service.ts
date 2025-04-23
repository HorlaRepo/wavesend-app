import { Injectable } from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';
import { PagedTransactionResponse } from '../models';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Create a subject
  private triggerFetchTransactions = new Subject<void>();

  private transactionsData = new ReplaySubject<PagedTransactionResponse>(1);
  transactionsData$ = this.transactionsData.asObservable();


  updateTransactionsData(data: PagedTransactionResponse) {
    this.transactionsData.next(data);
  }
  // Expose the observable$ part of the subject (read only)
  triggerFetchTransactions$ = this.triggerFetchTransactions.asObservable();

  // Function to call next on the subject, which will trigger all subscribers
  triggerFetch() {
    this.triggerFetchTransactions.next();
  }
}
