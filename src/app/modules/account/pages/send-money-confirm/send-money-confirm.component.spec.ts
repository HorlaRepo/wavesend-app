import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMoneyConfirmComponent } from './send-money-confirm.component';

describe('SendMoneyConfirmComponent', () => {
  let component: SendMoneyConfirmComponent;
  let fixture: ComponentFixture<SendMoneyConfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendMoneyConfirmComponent]
    });
    fixture = TestBed.createComponent(SendMoneyConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
