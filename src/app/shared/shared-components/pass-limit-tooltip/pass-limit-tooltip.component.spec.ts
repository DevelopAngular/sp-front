import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PassLimitTooltipComponent} from './pass-limit-tooltip.component';

describe('PassLimitTooltipComponent', () => {
  let component: PassLimitTooltipComponent;
  let fixture: ComponentFixture<PassLimitTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassLimitTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLimitTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
