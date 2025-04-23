import { TestBed } from '@angular/core/testing';

import { DepositStateService } from './deposit-state.service';

describe('DepositStateService', () => {
  let service: DepositStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepositStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
