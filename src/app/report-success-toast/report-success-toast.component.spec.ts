import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSuccessToastComponent } from './report-success-toast.component';

describe('ReportSuccessToastComponent', () => {
  let component: ReportSuccessToastComponent;
  let fixture: ComponentFixture<ReportSuccessToastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSuccessToastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSuccessToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
