import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledTransferOtpComponent } from './scheduled-transfer-otp.component';

describe('ScheduledTransferOtpComponent', () => {
  let component: ScheduledTransferOtpComponent;
  let fixture: ComponentFixture<ScheduledTransferOtpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduledTransferOtpComponent]
    });
    fixture = TestBed.createComponent(ScheduledTransferOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
