import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayReportCellComponent } from './display-report-cell.component';

describe('DisplayReportCellComponent', () => {
  let component: DisplayReportCellComponent;
  let fixture: ComponentFixture<DisplayReportCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayReportCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayReportCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
