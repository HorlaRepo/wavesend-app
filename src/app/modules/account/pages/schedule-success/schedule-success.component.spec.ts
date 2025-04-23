import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSuccessComponent } from './schedule-success.component';

describe('ScheduleSuccessComponent', () => {
  let component: ScheduleSuccessComponent;
  let fixture: ComponentFixture<ScheduleSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleSuccessComponent]
    });
    fixture = TestBed.createComponent(ScheduleSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
