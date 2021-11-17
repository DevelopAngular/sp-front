import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EncounterPreventionTooltipComponent} from './encounter-prevention-tooltip.component';

describe('EncounterPreventionTooltipComponent', () => {
  let component: EncounterPreventionTooltipComponent;
  let fixture: ComponentFixture<EncounterPreventionTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterPreventionTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterPreventionTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
