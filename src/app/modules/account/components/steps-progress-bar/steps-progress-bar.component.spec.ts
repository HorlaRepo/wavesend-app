import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsProgressBarComponent } from './steps-progress-bar.component';

describe('StepsProgressBarComponent', () => {
  let component: StepsProgressBarComponent;
  let fixture: ComponentFixture<StepsProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepsProgressBarComponent]
    });
    fixture = TestBed.createComponent(StepsProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
