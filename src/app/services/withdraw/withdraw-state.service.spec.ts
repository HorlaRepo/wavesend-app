import { TestBed } from '@angular/core/testing';

import { WithdrawStateService } from './withdraw-state.service';

describe('WithdrawStateService', () => {
  let service: WithdrawStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WithdrawStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
