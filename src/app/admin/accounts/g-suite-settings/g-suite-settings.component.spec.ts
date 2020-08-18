import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSuiteSettingsComponent } from './g-suite-settings.component';

describe('GSuiteSettingsComponent', () => {
  let component: GSuiteSettingsComponent;
  let fixture: ComponentFixture<GSuiteSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSuiteSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
