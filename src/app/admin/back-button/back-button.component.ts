import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {DarkThemeSwitch} from '../../dark-theme-switch';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {
  @Output()
  click: EventEmitter<any> = new EventEmitter();

  constructor(
    public darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
  }

}
