import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EncounterGroupComponent} from './encounter-group.component';

describe('EncounterGroupComponent', () => {
  let component: EncounterGroupComponent;
  let fixture: ComponentFixture<EncounterGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
