import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferOtpComponent } from './transfer-otp.component';

describe('TransferOtpComponent', () => {
  let component: TransferOtpComponent;
  let fixture: ComponentFixture<TransferOtpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferOtpComponent]
    });
    fixture = TestBed.createComponent(TransferOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
