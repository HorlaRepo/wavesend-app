import { TestBed } from '@angular/core/testing';

import { TransferBeneficiaryService } from './transfer-beneficiary.service';

describe('TransferBeneficiaryService', () => {
  let service: TransferBeneficiaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferBeneficiaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
