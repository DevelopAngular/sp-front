import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { GoogleLoginService } from '../google-login.service';

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.scss']
})

export class GoogleSigninComponent implements OnInit, OnDestroy {

  public name = 'Not Logged in!';

  public isLoaded = false;
  public progressValue = 0;
  public progressType = 'determinate';

  keyListener;
  demoLoginEnabled = false;

  demoUsername = '';
  demoPassword = '';

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

    let textBuffer = '';

    this.keyListener = (event) => {
      textBuffer += event.key;

      if (textBuffer.length > 20) {
        textBuffer = textBuffer.substring(textBuffer.length - 20);
      }

      if (textBuffer.endsWith('demo')) {
        this.toggleDemoLogin();
      }
    };

  }

  toggleDemoLogin() {
    this.demoLoginEnabled = !this.demoLoginEnabled;
  }

  demoLogin() {
    console.log(this.demoUsername, this.demoPassword);
    this.loginService.signInDemoMode(this.demoUsername, this.demoPassword);
  }

  initLogin() {
    this.loginService.signIn();
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyListener, false);
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.keyListener, false);
  }
}
