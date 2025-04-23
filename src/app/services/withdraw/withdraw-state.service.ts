import { Injectable } from '@angular/core';
import { BankAccount } from '../../services/models/bank-account';
import { Wallet } from '../../services/models/wallet';
import { GenericResponseWithdrawalData } from '../../services/models/generic-response-withdrawal-data';

export interface WithdrawState {
  amount?: number;
  narration?: string;
  transactionFee?: number;
  processingFee?: number;
  totalAmountInLocalCurrency?: number;
  currency?: string;
  exchangeRate?: number;
  selectedBank?: BankAccount;
  wallet?: Wallet;
  withdrawalResponse?: GenericResponseWithdrawalData;
  transactionId?: string;
  errorMessage?: string; 
  withdrawalToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WithdrawStateService {
  private readonly STORAGE_KEY = 'withdraw_state';
  
  constructor() {}

  /**
   * Save withdraw state to localStorage
   */
  saveWithdrawState(state: WithdrawState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving withdraw state:', error);
    }
  }

  /**
   * Get withdraw state from localStorage
   */
  getWithdrawState(): WithdrawState | null {
    try {
      const stateJson = localStorage.getItem(this.STORAGE_KEY);
      return stateJson ? JSON.parse(stateJson) : null;
    } catch (error) {
      console.error('Error retrieving withdraw state:', error);
      return null;
    }
  }

  /**
   * Update part of withdraw state
   */
  updateWithdrawState(partialState: Partial<WithdrawState>): void {
    try {
      const currentState = this.getWithdrawState() || {};
      const updatedState = { ...currentState, ...partialState };
      this.saveWithdrawState(updatedState);
    } catch (error) {
      console.error('Error updating withdraw state:', error);
    }
  }

  /**
   * Clear withdraw state from localStorage
   */
  clearWithdrawState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}