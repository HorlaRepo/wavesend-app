import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSuggestionComponent } from './floating-suggestion.component';

describe('FloatingSuggestionComponent', () => {
  let component: FloatingSuggestionComponent;
  let fixture: ComponentFixture<FloatingSuggestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FloatingSuggestionComponent]
    });
    fixture = TestBed.createComponent(FloatingSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
