import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {DarkThemeSwitch, SPTheme} from '../dark-theme-switch';
import {StorageService} from '../services/storage.service';
import {ScreenService} from '../services/screen.service';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-sp-appearance',
  templateUrl: './sp-appearance.component.html',
  styleUrls: ['./sp-appearance.component.scss']
})
export class SpAppearanceComponent implements OnInit {

  selectedTheme: string;
  isList: boolean;
  hideLayoutSettings: boolean;
  form: FormGroup;
  user: User;
  isStaff: boolean;
  showStudentProfileLocation: string = 'Everywhere';
  showLocationPiker: boolean;

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

  ngOnInit() {
    this.selectedTheme = this.darkTheme.currentTheme();
    this.isList = JSON.parse(this.storage.getItem('isGrid'));
    this.hideLayoutSettings = this.router.url.includes('/admin');
    this.userService.user$.subscribe((user) => {
      this.user = user;
      this.isStaff = User.fromJSON(user).isTeacher() || User.fromJSON(user).isAssistant();
      this.form = new FormGroup({
        show_expired_passes: new FormControl(user.show_expired_passes),
        show_student_profile_picture: new FormControl()
      });
    });
  }

  setSelectedTheme(evt: SPTheme) {
    this.selectedTheme = evt;
    this.darkTheme.switchTheme(evt);
  }

  selectedLayout(evt) {
    this.storage.setItem('isGrid', evt === 'List');
  }

  updateUser(show_expired_passes) {
    this.userService.updateUserRequest(this.user, {show_expired_passes});
  }
}
