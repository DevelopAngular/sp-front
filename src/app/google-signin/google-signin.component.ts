import { Component, NgZone } from '@angular/core';
import { GoogleLoginService } from '../google-login.service';

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.css']
})

export class GoogleSigninComponent {

  public name = 'Not Logged in!';

  public isLoaded = false;
  public progressValue = 0;
  public progressType = 'determinate';

  constructor(private _ngZone: NgZone, private loginService: GoogleLoginService) {

    let intervalId: any;

    this.loginService.isAuthLoaded().subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;

        if (isLoaded && intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        } else if (!this.isLoaded && intervalId === undefined) {
          let counter = 0;
          intervalId = setInterval(() => {

            this.progressValue = 98 * (1 - Math.pow(1.2, -counter));
            counter += 0.5;
          }, 50);
        }

      });
    });
  }

  initLogin() {
    this.loginService.signIn();
  }
}
