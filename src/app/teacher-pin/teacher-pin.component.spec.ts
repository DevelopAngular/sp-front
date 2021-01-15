import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TeacherPinComponent} from './teacher-pin.component';

describe('TeacherPinComponent', () => {
  let component: TeacherPinComponent;
  let fixture: ComponentFixture<TeacherPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
