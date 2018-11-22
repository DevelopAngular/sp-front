import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSuiteDialogComponent } from './g-suite-dialog.component';

describe('GSuiteDialogComponent', () => {
  let component: GSuiteDialogComponent;
  let fixture: ComponentFixture<GSuiteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSuiteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
