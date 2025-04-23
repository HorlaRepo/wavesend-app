import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawConfirmComponent } from './withdraw-confirm.component';

describe('WithdrawConfirmComponent', () => {
  let component: WithdrawConfirmComponent;
  let fixture: ComponentFixture<WithdrawConfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawConfirmComponent]
    });
    fixture = TestBed.createComponent(WithdrawConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
