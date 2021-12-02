import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EncounterPreventionDialogComponent} from './encounter-prevention-dialog.component';

describe('EncounterPreventionDialogComponent', () => {
  let component: EncounterPreventionDialogComponent;
  let fixture: ComponentFixture<EncounterPreventionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterPreventionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterPreventionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
