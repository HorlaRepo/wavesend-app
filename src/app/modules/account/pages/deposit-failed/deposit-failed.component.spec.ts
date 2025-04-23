import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositFailedComponent } from './deposit-failed.component';

describe('DepositFailedComponent', () => {
  let component: DepositFailedComponent;
  let fixture: ComponentFixture<DepositFailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DepositFailedComponent]
    });
    fixture = TestBed.createComponent(DepositFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
