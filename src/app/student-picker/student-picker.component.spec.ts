import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPickerComponent } from './student-picker.component';

describe('StudentPickerComponent', () => {
  let component: StudentPickerComponent;
  let fixture: ComponentFixture<StudentPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
