import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCompletenessComponent } from './profile-completeness.component';

describe('ProfileCompletenessComponent', () => {
  let component: ProfileCompletenessComponent;
  let fixture: ComponentFixture<ProfileCompletenessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileCompletenessComponent]
    });
    fixture = TestBed.createComponent(ProfileCompletenessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
