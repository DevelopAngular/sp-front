import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterDetectionDialogComponent } from './encounter-detection-dialog.component';

describe('EncounterDetectionDialogComponent', () => {
  let component: EncounterDetectionDialogComponent;
  let fixture: ComponentFixture<EncounterDetectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterDetectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterDetectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
