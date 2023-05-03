import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewHeaderComponent } from './teacher-review-header.component';

describe('TeacherReviewHeaderComponent', () => {
  let component: TeacherReviewHeaderComponent;
  let fixture: ComponentFixture<TeacherReviewHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherReviewHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherReviewHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
