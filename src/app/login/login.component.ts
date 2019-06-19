import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
// import { MapsAPILoader } from '@agm/core';
import { DeviceDetection } from '../device-detection.helper';
import { GoogleLoginService } from '../services/google-login.service';
import { UserService } from '../services/user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {constructUrl} from '../live-data/helpers';
import {catchError, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, from, Observable, of, throwError} from 'rxjs';
import {AuthContext, HttpService} from '../services/http-service';
import {LoginMethod} from '../google-signin/google-signin.component';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleAuthService} from '../services/google-auth.service';
import {StorageService} from '../services/storage.service';

declare const window;

export type LoginState = 'school' | 'profile';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('place') place: ElementRef;
  @Output() errorEvent: EventEmitter<any> = new EventEmitter();

  private placePredictionService;
  private currentPosition;

  private isIOSMobile: boolean;
  private isAndroid: boolean;
  public appLink: string;
  public titleText: string;
  public isMobileDevice: boolean = false;
  public trustedBackgroundUrl: SafeUrl;
  public showError = { loggedWith: null, error: null };
  public loginState: LoginState = 'profile';
  private jwt: JwtHelperService;



  constructor(
    private googleAuth: GoogleAuthService,
    private http: HttpClient,
    private httpService: HttpService,
    private googleLogin: GoogleLoginService,
    private userService: UserService,
    private loginService: GoogleLoginService,
    // private mapsApi: MapsAPILoader,
    private storage: StorageService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _zone: NgZone,
  ) {
    this.jwt = new JwtHelperService();
  }

  ngAfterViewInit(): void {

  }

  ngOnInit() {

    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Login Background.svg\')');

    this.isIOSMobile = DeviceDetection.isIOSMobile();
    this.isAndroid = DeviceDetection.isAndroid();

    if (this.isIOSMobile) {
      this.isMobileDevice = true;
      this.appLink = 'https://itunes.apple.com/us/app/smartpass-mobile/id1387337686?mt=8';
      this.titleText = 'Download SmartPass on the App Store to start making passes.';
    } else if (this.isAndroid) {
      this.isMobileDevice = true;
      this.appLink = 'https://play.google.com/store/apps/details?id=app.smartpass.smartpass';
      this.titleText = 'Download SmartPass on the Google Play Store to start making passes.';
    }
  }
  initLogin() {


    return this.googleLogin.GoogleOauth.signIn()
            .then((auth) => {
              return auth.getAuthResponse();
            });

            // .catch((err) => {
            //       console.log('Error occured =====>', err);
            //
            //       if (err && err.error !== 'popup_closed_by_user') {
            //         console.log('Erro should be shown ====>')
            //         this.loginService.showLoginError$.next(true);
            //       }
            //       // this.showSpinner = false;
            //     });



    // this.loggedWith = LoginMethod.OAuth;
    // this.showSpinner = true;
    // this.loginService.showLoginError$.next(false);





    // await this.loginService
    //   .signIn()
    //   .catch((err) => {
    //     console.log('Error occured =====>', err);
    //
    //     if (err && err.error !== 'popup_closed_by_user') {
    //       console.log('Erro should be shown ====>')
    //       this.loginService.showLoginError$.next(true);
    //     }
    //     // this.showSpinner = false;
    //   });
  }
  checkSchool(placeId: string) {
    this.http.get(constructUrl('https://smartpass.app/api/staging/onboard/schools/check_school', {place_id: placeId}), {
      headers: {
        'Authorization': 'Bearer ' + 'test' // it's temporary
      }})
      .pipe(
        switchMap((onboard: any): Observable<any> => {
          if (!onboard.school_registered) {
           return from(this.initLogin())
             .pipe(
               tap(p => console.log(p)),
                switchMap((auth: any) => {
                  console.log(auth);

                  const hd = this.jwt.decodeToken(auth.id_token)['hd'];

                  // debugger

                  if (!hd || hd === 'gmail.com') {
                    // this.loginState = 'profile';
                    this.loginService.showLoginError$.next(false);
                    this.showError.loggedWith = LoginMethod.OAuth;
                    this.showError.error = true;
                    return of(null);
                  } else {

                    return this.http.post('https://smartpass.app/api/staging/onboard/schools', {
                      user_token: auth.id_token,
                      google_place_id: placeId
                    }, {
                      headers: {
                        'Authorization': 'Bearer ' + 'test' // it's temporary
                      }
                    }).pipe(
                      map((res: any) => {
                        this._zone.run(() => {
                          console.log(res);
                          this.googleLogin.updateAuth(auth);
                          this.storage.setItem('last_school_id', res.school.id);
                        });
                      })
                    );

                  }
                }),
               catchError((err) => {
                 console.log('Error occured =====>', err);

                 if (err && err.error !== 'popup_closed_by_user') {
                   console.log('Erro should be shown ====>')
                   this.loginService.showLoginError$.next(true);
                 }
                 return throwError(err);

               })
           );
          } else {
            this.loginState = 'profile';
            return of(placeId);
          }
        })
      )
      .subscribe((res) => {
        console.log(res);
    });
  }
  // search(query: string) {
  //   console.log(query);
  //   this.placePredictionService.getQueryPredictions({
  //     location: this.currentPosition,
  //     input: query,
  //     radius: 1000000
  //   }, (predictions, status) => {
  //     console.log(predictions, status, window.google.maps.places.PlacesServiceStatus.OK);
  //   });
  // }
  onClose(evt) {
    setTimeout(() => {
      this.loginService.showLoginError$.next(false);
      this.showError.error = evt;
      this.loginState = 'profile';
    }, 400);
  }
  onError() {
    this.router.navigate(['error']);
  }
}
