import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositWithdrawMenuComponent } from './deposit-withdraw-menu.component';

describe('DepositWithdrawMenuComponent', () => {
  let component: DepositWithdrawMenuComponent;
  let fixture: ComponentFixture<DepositWithdrawMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DepositWithdrawMenuComponent]
    });
    fixture = TestBed.createComponent(DepositWithdrawMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
