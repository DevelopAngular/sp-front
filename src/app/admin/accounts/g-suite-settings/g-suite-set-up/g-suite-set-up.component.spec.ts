import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSuiteSetUpComponent } from './g-suite-set-up.component';

describe('GSuiteSetUpComponent', () => {
  let component: GSuiteSetUpComponent;
  let fixture: ComponentFixture<GSuiteSetUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSuiteSetUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
