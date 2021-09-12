import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GSuiteConnectComponent} from './g-suite-connect.component';

describe('GSuiteConnectComponent', () => {
  let component: GSuiteConnectComponent;
  let fixture: ComponentFixture<GSuiteConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GSuiteConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GSuiteConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
