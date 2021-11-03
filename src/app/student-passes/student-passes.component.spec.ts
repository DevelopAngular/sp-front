import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StudentPassesComponent} from './student-passes.component';

describe('StudentPassesComponent', () => {
  let component: StudentPassesComponent;
  let fixture: ComponentFixture<StudentPassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentPassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentPassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
