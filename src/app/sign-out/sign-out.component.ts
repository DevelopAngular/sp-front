import { AfterContentInit, Component } from '@angular/core';
import { HttpService } from '../http-service';
import { GoogleLoginService } from '../google-login.service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements AfterContentInit {

  constructor(private http: HttpService, private loginService: GoogleLoginService) {
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.http.clearInternal();
      this.loginService.clearInternal(true);

      location.href = '/';
    }, 500);
  }


}
