import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledTransferDetailComponent } from './scheduled-transfer-detail.component';

describe('ScheduledTransferDetailComponent', () => {
  let component: ScheduledTransferDetailComponent;
  let fixture: ComponentFixture<ScheduledTransferDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduledTransferDetailComponent]
    });
    fixture = TestBed.createComponent(ScheduledTransferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
