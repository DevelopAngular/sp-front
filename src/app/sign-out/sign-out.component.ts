import { AfterContentInit, Component } from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import { HttpService } from '../services/http-service';
import {environment} from '../../environments/environment';
import {UserService} from '../services/user.service';
import {DarkThemeSwitch} from '../dark-theme-switch';
declare const window;

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements AfterContentInit {

  constructor(
    private http: HttpService,
    private loginService: GoogleLoginService,
    private userService: UserService,
    private darkSwitch: DarkThemeSwitch
  ) {
    this.http.setSchool(null);
    this.userService.clearUser();
    // if (this.darkSwitch.isEnabled$.value) {
    //   this.darkSwitch.isEnabled$.next(false);
    // }
  }

  ngAfterContentInit() {

    setTimeout(() => {
      this.http.clearInternal();
      this.loginService.clearInternal(true);
      // this.userService.userData.next(null);
      // this.userService.userData.complete();

      // debugger
      // this.router.navigate(['']);

      // window.location.href = '/';
      window.location.href = environment.production ? '/app' : '/';
    }, 500);
  }


}
