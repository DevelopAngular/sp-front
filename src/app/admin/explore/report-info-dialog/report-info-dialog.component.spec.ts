import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportInfoDialogComponent} from './report-info-dialog.component';

describe('ReportInfoDialogComponent', () => {
  let component: ReportInfoDialogComponent;
  let fixture: ComponentFixture<ReportInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
