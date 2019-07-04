import { Component, OnInit } from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-privacy-card',
  templateUrl: './privacy-card.component.html',
  styleUrls: ['./privacy-card.component.scss']
})
export class PrivacyCardComponent implements OnInit {

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {
  }

}
