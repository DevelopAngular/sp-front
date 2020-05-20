import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DarkThemeSwitch, SPTheme} from '../dark-theme-switch';
import {StorageService} from '../services/storage.service';
import {ScreenService} from '../services/screen.service';
import {Observable} from 'rxjs';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sp-appearance',
  templateUrl: './sp-appearance.component.html',
  styleUrls: ['./sp-appearance.component.scss']
})
export class SpAppearanceComponent implements OnInit {

  selectedTheme: string;
  isList: boolean;
  user$: Observable<User>;
  hideLayoutSettings: boolean;

  constructor(
    private darkTheme: DarkThemeSwitch,
    public dialogRef: MatDialogRef<SpAppearanceComponent>,
    private storage: StorageService,
    private screenService: ScreenService,
    private userService: UserService,
    public router: Router,
  ) { }

  get IpadDevice() {
    return this.screenService.isIpadWidth;
  }
  get extraLargeDevice() {
    return this.screenService.isDeviceLargeExtra;
  }
  // get hostWidth() {
  //   return this.extraSmallDevice ?
  //           300 : this.extraLargeDevice ?
  //             335 : 425;
  // }
  ngOnInit() {
    this.selectedTheme = this.darkTheme.currentTheme();
    this.isList = JSON.parse(this.storage.getItem('isGrid'));
    this.user$ = this.userService.user$;
    this.hideLayoutSettings = this.router.url.includes('/admin');
  }

  setSelectedTheme(evt: SPTheme) {
    this.selectedTheme = evt;
    this.storage.setItem('dark-theme', evt);
    this.darkTheme.switchTheme(evt);
  }

  selectedLayout(evt) {
    this.storage.setItem('isGrid', evt === 'List');
  }
}
