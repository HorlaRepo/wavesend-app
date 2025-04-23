import { TestBed } from '@angular/core/testing';

import { UserInactivityService } from './user-inactivity.service';

describe('UserInactivityService', () => {
  let service: UserInactivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInactivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
