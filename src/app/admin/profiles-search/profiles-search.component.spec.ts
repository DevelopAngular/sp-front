import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilesSearchComponent } from './profiles-search.component';

describe('ProfilesSearchComponent', () => {
  let component: ProfilesSearchComponent;
  let fixture: ComponentFixture<ProfilesSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilesSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
