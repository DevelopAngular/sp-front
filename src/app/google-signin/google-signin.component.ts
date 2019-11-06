import {Component, NgZone, OnInit} from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';

import {of} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {Meta, Title} from '@angular/platform-browser';

declare const window;

export enum LoginMethod { OAuth = 1, LocalStrategy = 2}

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.scss']
})

export class GoogleSigninComponent implements OnInit {

  public isLoaded = false;
  public showSpinner: boolean = false;
  public loggedWith: number;

  demoLoginEnabled = false;

  demoUsername = '';
  demoPassword = '';

  constructor(
    private httpService: HttpService,
    private _ngZone: NgZone,
    private loginService: GoogleLoginService,
    private titleService: Title,
    private metaService: Meta,
  ) {
    this.loginService.isAuthLoaded().subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;
      });
    });
    this.httpService.errorToast$.subscribe(v => {
      this.showSpinner = !!v;
    });
    this.loginService.showLoginError$.subscribe((show: boolean) => {
      if (show) {
        const errMessage = this.loggedWith === 1
          ? 'Please sign in with your school account or contact your school administrator.'
          : 'Please check your username and password or contact your school administrator.';

        this.httpService.errorToast$.next({
          header: 'Oops! Sign in error.',
          message: errMessage
        });
      }
    });
  }
  updateDemoUsername(event) {
    this.demoUsername = event;
  }

  toggleDemoLogin() {
    this.demoLoginEnabled = !this.demoLoginEnabled;
  }

  demoLogin() {
    this.showSpinner = true;
    if (this.demoUsername && this.demoPassword) {
      this.titleService.setTitle('SmartPass');
      this.metaService.removeTag('name = "description"');
      this.loggedWith = LoginMethod.LocalStrategy;
      this.loginService.showLoginError$.next(false);
      window.waitForAppLoaded(true);
      of(this.loginService.signInDemoMode(this.demoUsername, this.demoPassword))
      .pipe(
        tap((res) => { console.log(res); }),
        finalize(() => {
          this.showSpinner = false;
        }),
      );
    }
  }

  initLogin() {

    this.loggedWith = LoginMethod.OAuth;
    this.showSpinner = true;
    this.loginService.showLoginError$.next(false);
    this.loginService
      .signIn()
      .then(() => {
        this.showSpinner = false;
        // window.waitForAppLoaded();
      })
      .catch((err) => {
        if (err && err.error !== 'popup_closed_by_user') {
          this.loginService.showLoginError$.next(true);
        }
        this.showSpinner = false;
      });
  }

  ngOnInit(): void {}
}
