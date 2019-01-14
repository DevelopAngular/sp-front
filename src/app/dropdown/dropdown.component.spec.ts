import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDropdownComponent } from './teacher-dropdown.component';

describe('TeacherDropdownComponent', () => {
  let component: TeacherDropdownComponent;
  let fixture: ComponentFixture<TeacherDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
