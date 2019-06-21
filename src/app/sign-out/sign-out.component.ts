import { AfterContentInit, Component } from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import { HttpService } from '../services/http-service';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements AfterContentInit {

  constructor(private http: HttpService, private loginService: GoogleLoginService, private router: Router) {
    this.http.setSchool(null);
  }

  ngAfterContentInit() {

    setTimeout(() => {
      this.http.clearInternal();
      this.loginService.clearInternal(true);
      this.router.navigate(['']);
      // location.href = environment.production ? '/app' : '/';
    }, 500);
  }


}
