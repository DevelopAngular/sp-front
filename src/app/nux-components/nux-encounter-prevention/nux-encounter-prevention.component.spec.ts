import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NuxEncounterPreventionComponent} from './nux-encounter-prevention.component';

describe('NuxEncounterPreventionComponent', () => {
  let component: NuxEncounterPreventionComponent;
  let fixture: ComponentFixture<NuxEncounterPreventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuxEncounterPreventionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuxEncounterPreventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
