import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawSuccessComponent } from './withdraw-success.component';

describe('WithdrawSuccessComponent', () => {
  let component: WithdrawSuccessComponent;
  let fixture: ComponentFixture<WithdrawSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawSuccessComponent]
    });
    fixture = TestBed.createComponent(WithdrawSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
