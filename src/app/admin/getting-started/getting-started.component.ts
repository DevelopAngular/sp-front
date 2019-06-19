import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
  }

}
