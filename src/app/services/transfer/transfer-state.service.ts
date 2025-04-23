import { Injectable } from '@angular/core';
import { UserInfo } from '../../services/keycloack/user-info';
import { UserRepresentation } from '../models/user-representation';

export interface TransferState {
  sender?: UserInfo;
  recipient?: UserRepresentation;
  amount?: number;
  narration?: string;
  transferId?: string;
  transferToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferStateService {
  private readonly STORAGE_KEY = 'transfer_state';
  
  constructor() {}

  /**
   * Save transfer state to localStorage
   */
  saveTransferState(state: TransferState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving transfer state:', error);
    }
  }

  /**
   * Get transfer state from localStorage
   */
  getTransferState(): TransferState | null {
    try {
      const stateJson = localStorage.getItem(this.STORAGE_KEY);
      return stateJson ? JSON.parse(stateJson) : null;
    } catch (error) {
      console.error('Error retrieving transfer state:', error);
      return null;
    }
  }

  /**
   * Clear transfer state from localStorage
   */
  clearTransferState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }


  updateTransferState(partialState: Partial<TransferState>): void {
    try {
      const currentState = this.getTransferState() || {};
      const updatedState = { ...currentState, ...partialState };
      this.saveTransferState(updatedState);
    } catch (error) {
      console.error('Error updating withdraw state:', error);
    }
  }

  /**
   * Generate a unique transfer ID
   */
  generateTransferId(): string {
    return `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}