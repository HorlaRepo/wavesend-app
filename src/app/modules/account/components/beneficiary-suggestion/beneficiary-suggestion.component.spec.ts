import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiarySuggestionComponent } from './beneficiary-suggestion.component';

describe('BeneficiarySuggestionComponent', () => {
  let component: BeneficiarySuggestionComponent;
  let fixture: ComponentFixture<BeneficiarySuggestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeneficiarySuggestionComponent]
    });
    fixture = TestBed.createComponent(BeneficiarySuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
