import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BigStudentPassCardComponent} from './big-student-pass-card.component';

describe('BigStudentPassCardComponent', () => {
  let component: BigStudentPassCardComponent;
  let fixture: ComponentFixture<BigStudentPassCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BigStudentPassCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BigStudentPassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
