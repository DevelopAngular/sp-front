import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DarkThemeSwitch, SPTheme} from '../dark-theme-switch';
import {StorageService} from '../services/storage.service';
import {ScreenService} from '../services/screen.service';

@Component({
  selector: 'app-sp-appearance',
  templateUrl: './sp-appearance.component.html',
  styleUrls: ['./sp-appearance.component.scss']
})
export class SpAppearanceComponent implements OnInit {

  selectedTheme: string;

  constructor(
    private darkTheme: DarkThemeSwitch,
    public dialogRef: MatDialogRef<SpAppearanceComponent>,
    private storage: StorageService,
    private screenService: ScreenService
  ) { }

  get extraSmallDevice() {
    return this.screenService.isDeviceSmallExtra;
  }
  get extraLargeDevice() {
    return this.screenService.isDeviceLargeExtra;
  }
  get hostWidth() {
    return this.extraSmallDevice ?
            300 : this.extraLargeDevice ?
              335 : 425;
  }
  ngOnInit() {
    this.selectedTheme = this.darkTheme.currentTheme();
  }
  setSelectedTheme(evt: SPTheme) {
    this.selectedTheme = evt;
    this.storage.setItem('dark-theme', evt);
    this.darkTheme.switchTheme(evt);
  }
}
