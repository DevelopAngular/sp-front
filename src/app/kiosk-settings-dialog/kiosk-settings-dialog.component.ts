import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {FormBuilder, FormGroup} from '@angular/forms';
import {KioskModeService} from '../services/kiosk-mode.service';

@Component({
  selector: 'app-kiosk-settings-dialog',
  templateUrl: './kiosk-settings-dialog.component.html',
  styleUrls: ['./kiosk-settings-dialog.component.scss']
})
export class KioskSettingsDialogComponent implements OnInit {

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<KioskSettingsDialogComponent>,
    private kioskModeService: KioskModeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(this.kioskModeService.getKioskModeSettings());
    this.form.valueChanges.subscribe(value => {
      this.kioskModeService.setKioskModeSettings(this.form.value);
    });
  }

  close() {
    this.dialogRef.close();
  }

  control(id: string): FormGroup {
    return this.form.get(id) as FormGroup;
  }

}
