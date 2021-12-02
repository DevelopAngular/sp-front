import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportDescriptionComponent} from './report-description.component';

describe('ReportDescriptionComponent', () => {
  let component: ReportDescriptionComponent;
  let fixture: ComponentFixture<ReportDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
