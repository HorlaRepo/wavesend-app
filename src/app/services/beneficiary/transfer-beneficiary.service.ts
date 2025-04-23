// src/app/services/beneficiary/beneficiary.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap, map } from 'rxjs/operators';
import { UserBeneficiariesControllerService } from 'src/app/services/services/user-beneficiaries-controller.service';
import { UserBeneficiariesResponse, UserBeneficiaryResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TransferBeneficiaryService {
  private beneficiariesSubject = new BehaviorSubject<UserBeneficiaryResponse[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Expose as observables
  beneficiaries$ = this.beneficiariesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private userBeneficiariesService: UserBeneficiariesControllerService) {}

  /**
   * Get user beneficiaries
   */
  getBeneficiaries(): Observable<UserBeneficiariesResponse> {
    this.loadingSubject.next(true);
    
    return this.userBeneficiariesService.getUserBeneficiaries().pipe(
      map(response => response.data || { beneficiaries: [] }),
      tap(data => {
        if (data?.beneficiaries) {
          this.beneficiariesSubject.next(data.beneficiaries);
        }
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Add a beneficiary
   */
  addBeneficiary(email: string, name: string): Observable<any> {
    return this.userBeneficiariesService.addUserBeneficiary({
      body: { email, name }
    }).pipe(
      tap(response => {
        if (response?.data) {
          // Update the beneficiaries list
          const currentBeneficiaries = this.beneficiariesSubject.value;
          this.beneficiariesSubject.next([...currentBeneficiaries, response.data]);
        }
      })
    );
  }

  /**
   * Delete a beneficiary
   */
  deleteBeneficiary(id: number): Observable<any> {
    return this.userBeneficiariesService.deleteUserBeneficiary({
      beneficiaryId: id
    }).pipe(
      tap(() => {
        // Update the beneficiaries list
        const currentBeneficiaries = this.beneficiariesSubject.value;
        this.beneficiariesSubject.next(
          currentBeneficiaries.filter(beneficiary => beneficiary.id !== id)
        );
      })
    );
  }
}