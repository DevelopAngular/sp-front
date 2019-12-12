import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';

@Component({
  selector: 'app-sp-appearance',
  templateUrl: './sp-appearance.component.html',
  styleUrls: ['./sp-appearance.component.scss']
})
export class SpAppearanceComponent implements OnInit {

  private selectedTheme: string;

  constructor(
    private darkTheme: DarkThemeSwitch,
    public dialogRef: MatDialogRef<SpAppearanceComponent>
  ) { }

  ngOnInit() {
    // this.selectedTheme = this.darkTheme.isEnabled$.value;
  }
  closeWith(evt) {
    this.dialogRef.close(evt);
    console.log(evt);
  }
  setSelectedTheme(evt) {
    this.selectedTheme = evt;
  }
}
