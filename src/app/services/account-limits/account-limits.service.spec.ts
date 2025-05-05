import { TestBed } from '@angular/core/testing';

import { AccountLimitsService } from './account-limits.service';

describe('AccountLimitsService', () => {
  let service: AccountLimitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountLimitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
