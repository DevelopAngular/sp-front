import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSuiteAccountLinkComponent } from './g-suite-account-link.component';

describe('GSuiteAccountLinkComponent', () => {
  let component: GSuiteAccountLinkComponent;
  let fixture: ComponentFixture<GSuiteAccountLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSuiteAccountLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteAccountLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
