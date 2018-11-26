import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRestrictionsDialogComponent } from './accounts-dialog.component';

describe('EditRestrictionsDialogComponent', () => {
  let component: EditRestrictionsDialogComponent;
  let fixture: ComponentFixture<EditRestrictionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRestrictionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRestrictionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
