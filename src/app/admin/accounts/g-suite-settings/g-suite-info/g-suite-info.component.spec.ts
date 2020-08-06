import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSuiteInfoComponent } from './g-suite-info.component';

describe('GSuiteInfoComponent', () => {
  let component: GSuiteInfoComponent;
  let fixture: ComponentFixture<GSuiteInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSuiteInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
