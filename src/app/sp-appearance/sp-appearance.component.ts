import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DarkThemeSwitch, SPTheme} from '../dark-theme-switch';
import {StorageService} from '../services/storage.service';

@Component({
  selector: 'app-sp-appearance',
  templateUrl: './sp-appearance.component.html',
  styleUrls: ['./sp-appearance.component.scss']
})
export class SpAppearanceComponent implements OnInit {

  public selectedTheme: string;

  constructor(
    private darkTheme: DarkThemeSwitch,
    public dialogRef: MatDialogRef<SpAppearanceComponent>,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.selectedTheme = this.darkTheme.currentTheme();
  }
  close() {
    this.dialogRef.close();
  }
  setSelectedTheme(evt: SPTheme) {
    this.selectedTheme = evt;
    this.storage.setItem('dark-theme', evt);
    this.darkTheme.switchTheme(evt);
  }
}
