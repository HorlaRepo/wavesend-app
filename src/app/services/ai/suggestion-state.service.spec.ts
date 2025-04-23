import { TestBed } from '@angular/core/testing';

import { SuggestionStateService } from './suggestion-state.service';

describe('SuggestionStateService', () => {
  let service: SuggestionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
