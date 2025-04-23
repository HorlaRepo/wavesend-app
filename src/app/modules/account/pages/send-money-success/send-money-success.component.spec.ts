import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMoneySuccessComponent } from './send-money-success.component';

describe('SendMoneySuccessComponent', () => {
  let component: SendMoneySuccessComponent;
  let fixture: ComponentFixture<SendMoneySuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendMoneySuccessComponent]
    });
    fixture = TestBed.createComponent(SendMoneySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
