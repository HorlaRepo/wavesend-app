import { Injectable } from '@angular/core';

export interface DepositState {
  amount?: number;
  paymentMethod?: string;
  transactionRef?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepositStateService {
  private readonly STORAGE_KEY = 'deposit_state';
  
  constructor() {}

  /**
   * Save deposit state to localStorage
   */
  saveDepositState(state: DepositState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving deposit state:', error);
    }
  }

  /**
   * Get deposit state from localStorage
   */
  getDepositState(): DepositState | null {
    try {
      const stateJson = localStorage.getItem(this.STORAGE_KEY);
      return stateJson ? JSON.parse(stateJson) : null;
    } catch (error) {
      console.error('Error retrieving deposit state:', error);
      return null;
    }
  }

  /**
   * Clear deposit state from localStorage
   */
  clearDepositState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}