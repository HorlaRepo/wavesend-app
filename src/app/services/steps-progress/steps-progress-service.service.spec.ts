import { TestBed } from '@angular/core/testing';

import { StepsProgressServiceService } from './steps-progress-service.service';

describe('StepsProgressServiceService', () => {
  let service: StepsProgressServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepsProgressServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
