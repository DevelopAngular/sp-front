import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSignUpComponent } from './school-sign-up.component';

describe('SchoolSignUpComponent', () => {
  let component: SchoolSignUpComponent;
  let fixture: ComponentFixture<SchoolSignUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolSignUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
