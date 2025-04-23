import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawFailedComponent } from './withdraw-failed.component';

describe('WithdrawFailedComponent', () => {
  let component: WithdrawFailedComponent;
  let fixture: ComponentFixture<WithdrawFailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawFailedComponent]
    });
    fixture = TestBed.createComponent(WithdrawFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
