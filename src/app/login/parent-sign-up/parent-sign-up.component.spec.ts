import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentSignUpComponent } from './parent-sign-up.component';

describe('ParentSignUpComponent', () => {
  let component: ParentSignUpComponent;
  let fixture: ComponentFixture<ParentSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentSignUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
