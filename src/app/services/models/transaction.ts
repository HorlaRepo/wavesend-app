/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { FlaggedTransactionReason } from '../models/flagged-transaction-reason';
import { SecurityQuestion } from '../models/security-question';
import { Wallet } from '../models/wallet';
export interface Transaction {
  amount?: number;
  completedAt?: string;
  currentStatus?: string;
  deliveryMethod?: 'WALLET' | 'AGENT_LOCATION';
  description?: string;
  failureReason?: string;
  fee?: number;
  flagged?: boolean;
  flaggedTransactionReasons?: Array<FlaggedTransactionReason>;
  mtcn?: string;
  narration?: string;
  operation?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'REVERSAL' | 'REFUND';
  providerId?: string;
  referenceNumber?: string;
  refundStatus?: 'PARTIALLY_REFUNDABLE' | 'FULLY_REFUNDABLE' | 'NON_REFUNDABLE';
  refundableAmount?: number;
  securityQuestion?: SecurityQuestion;
  sendingMethod?: 'FROM_WALLET' | 'FROM_AGENT_LOCATION';
  sessionId?: string;
  source?: 'STRIPE_DEPOSIT' | 'FLUTTERWAVE_DEPOSIT' | 'CRYPTOCURRENCY';
  transactionDate?: string;
  transactionId?: number;
  transactionType?: 'DEBIT' | 'CREDIT';
  wallet?: Wallet;
}
