import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCardDialogComponent } from './profile-card-dialog.component';

describe('ProfileCardDialogComponent', () => {
  let component: ProfileCardDialogComponent;
  let fixture: ComponentFixture<ProfileCardDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileCardDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
