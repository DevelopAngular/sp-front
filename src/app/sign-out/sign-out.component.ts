import { AfterContentInit, Component } from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import { HttpService } from '../services/http-service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements AfterContentInit {

  constructor(private http: HttpService, private loginService: GoogleLoginService) {
    this.http.schoolIdSubject.next(null);
  }

  ngAfterContentInit() {

    setTimeout(() => {
      this.http.clearInternal();
      this.loginService.clearInternal(true);

      location.href = '/';
    }, 500);
  }


}
