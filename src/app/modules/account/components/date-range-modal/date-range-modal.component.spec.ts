import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeModalComponent } from './date-range-modal.component';

describe('DateRangeModalComponent', () => {
  let component: DateRangeModalComponent;
  let fixture: ComponentFixture<DateRangeModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateRangeModalComponent]
    });
    fixture = TestBed.createComponent(DateRangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
