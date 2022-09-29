import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskSettingsDialogComponent } from './kiosk-settings-dialog.component';

describe('KioskSettingsDialogComponent', () => {
  let component: KioskSettingsDialogComponent;
  let fixture: ComponentFixture<KioskSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KioskSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KioskSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
