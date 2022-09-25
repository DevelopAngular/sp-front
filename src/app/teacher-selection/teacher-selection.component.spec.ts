import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSelectionComponent } from './teacher-selection.component';

describe('TeacherSelectionComponent', () => {
  let component: TeacherSelectionComponent;
  let fixture: ComponentFixture<TeacherSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
