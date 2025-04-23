import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastNotificationsComponent } from './toast-notifications.component';

describe('ToastNotificationsComponent', () => {
  let component: ToastNotificationsComponent;
  let fixture: ComponentFixture<ToastNotificationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToastNotificationsComponent]
    });
    fixture = TestBed.createComponent(ToastNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
