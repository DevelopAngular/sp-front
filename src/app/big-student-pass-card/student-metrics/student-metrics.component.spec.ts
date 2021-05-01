import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StudentMetricsComponent} from './student-metrics.component';

describe('StudentMetricsComponent', () => {
  let component: StudentMetricsComponent;
  let fixture: ComponentFixture<StudentMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
