import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentInfoService {

  setTransactionReference(transactionRef: string): void {
    localStorage.setItem('transactionRef', transactionRef);
  }

  getTransactionReference(): string | null{
    return localStorage.getItem('transactionRef');
  }

  clearTransactionReference(): void {
    sessionStorage.removeItem('transactionRef');
  }

}
