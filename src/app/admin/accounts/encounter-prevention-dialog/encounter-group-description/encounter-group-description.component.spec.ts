import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EncounterGroupDescriptionComponent} from './encounter-group-description.component';

describe('EncounterGroupDescriptionComponent', () => {
  let component: EncounterGroupDescriptionComponent;
  let fixture: ComponentFixture<EncounterGroupDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterGroupDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterGroupDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
