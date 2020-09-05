import { AfterContentInit, Component } from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import { HttpService } from '../services/http-service';
import {environment} from '../../environments/environment';
import {UserService} from '../services/user.service';
import {take} from 'rxjs/operators';
import {StorageService} from '../services/storage.service';
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
    private storage: StorageService
  ) {
    this.userService.user$
      .pipe(take(1))
      .subscribe(user => {
      if (user.sync_types.includes('gg4l')) {
        this.storage.setItem(`gg4l_invalidate`, true);
      }
    });
    this.http.setSchool(null);
    this.userService.clearUser();
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
