import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTransferComponent } from './schedule-transfer.component';

describe('ScheduleTransferComponent', () => {
  let component: ScheduleTransferComponent;
  let fixture: ComponentFixture<ScheduleTransferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleTransferComponent]
    });
    fixture = TestBed.createComponent(ScheduleTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
