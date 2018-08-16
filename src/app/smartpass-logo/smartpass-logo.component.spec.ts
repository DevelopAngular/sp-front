import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartpassLogoComponent } from './smartpass-logo.component';

describe('SmartpassLogoComponent', () => {
  let component: SmartpassLogoComponent;
  let fixture: ComponentFixture<SmartpassLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartpassLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartpassLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
