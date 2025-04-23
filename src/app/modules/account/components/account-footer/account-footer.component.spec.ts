import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountFooterComponent } from './account-footer.component';

describe('AccountFooterComponent', () => {
  let component: AccountFooterComponent;
  let fixture: ComponentFixture<AccountFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountFooterComponent]
    });
    fixture = TestBed.createComponent(AccountFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
