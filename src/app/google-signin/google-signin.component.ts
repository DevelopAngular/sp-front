import {Component, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import {MatDialog} from '@angular/material';

import {BehaviorSubject, of, Subject} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';

declare const window;

export enum LoginMethod { OAuth = 1, LocalStrategy = 2}

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.scss']
})

export class GoogleSigninComponent implements OnInit, OnDestroy {

  @Output() showError: EventEmitter<{ loggedWith: number, error: boolean} > = new EventEmitter<{loggedWith: number, error: boolean}>();


  public name = 'Not Logged in!';

  public isLoaded = false;
  public progressValue = 0;
  public progressType = 'determinate';
  public showSpinner: boolean = false;
  public loggedWith: number;
  // public showError: BehaviorSubject<{ loggedWith: number, error: boolean} > = new BehaviorSubject<{loggedWith: number, error: boolean}>({
  //   loggedWith: this.loggedWith,
  //   error: false
  // });
  // public showError = {
  //     loggedWith: null,
  //     error: null
  // };

  keyListener;
  demoLoginEnabled = false;

  demoUsername = '';
  demoPassword = '';

  constructor(private _ngZone: NgZone, private loginService: GoogleLoginService, private matDialog: MatDialog) {

    let intervalId: any;

    this.loginService.isAuthLoaded().subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;

        if (this.isLoaded && intervalId !== undefined) {
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

    this.loginService.showLoginError$.subscribe((show: boolean) => {

      this.showSpinner = show;
        console.log(show, this.loggedWith);
        this.showError.emit({
            loggedWith: this.loggedWith,
            error: show
        });
      });
  }
  onClose(evt) {
    setTimeout(() => {
      this.showSpinner = false;
      this.showError.error = evt;
    }, 300);
  }
  updateDemoUsername(event) {
    // console.log('UN ===>', event, this.demoLoginEnabled);
    this.demoUsername = event;
  }

  toggleDemoLogin() {
    this.demoLoginEnabled = !this.demoLoginEnabled;
    // console.log('Bug there ===>', this.demoLoginEnabled);
    // if(!this.demoLoginEnabled) {
    //   console.log(e);
    // };
  }

  demoLogin() {
    this.showSpinner = true;
    if (this.demoUsername && this.demoPassword) {
      this.loggedWith = LoginMethod.LocalStrategy;
      this.loginService.showLoginError$.next(false);
      // debugger

      of(this.loginService.signInDemoMode(this.demoUsername, this.demoPassword))
      .pipe(
        tap((res) => { console.log(res); }),
        finalize(() => {
          this.showSpinner = false;
        })
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
      })
      .catch((err) => {
        console.log('Error occured =====>', err);

        if (err && err.error !== 'popup_closed_by_user') {
          console.log('Erro should be shown ====>')
          this.loginService.showLoginError$.next(true);
        }
        this.showSpinner = false;
      });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyListener, false);
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.keyListener, false);
    window.appLoaded();
  }
}
