import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalOtpComponent } from './withdrawal-otp.component';

describe('WithdrawalOtpComponent', () => {
  let component: WithdrawalOtpComponent;
  let fixture: ComponentFixture<WithdrawalOtpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawalOtpComponent]
    });
    fixture = TestBed.createComponent(WithdrawalOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
