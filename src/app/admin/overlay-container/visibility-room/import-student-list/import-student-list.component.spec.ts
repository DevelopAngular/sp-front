import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportStudentListComponent } from './import-student-list.component';

describe('ImportStudentListComponent', () => {
  let component: ImportStudentListComponent;
  let fixture: ComponentFixture<ImportStudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportStudentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
