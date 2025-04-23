import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMoneyFailedComponent } from './send-money-failed.component';

describe('SendMoneyFailedComponent', () => {
  let component: SendMoneyFailedComponent;
  let fixture: ComponentFixture<SendMoneyFailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendMoneyFailedComponent]
    });
    fixture = TestBed.createComponent(SendMoneyFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
