import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StudentPassesInfoCardComponent} from './student-passes-info-card.component';

describe('StudentPassesInfoCardComponent', () => {
  let component: StudentPassesInfoCardComponent;
  let fixture: ComponentFixture<StudentPassesInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentPassesInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentPassesInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
