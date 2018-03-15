import {Component, ElementRef, Input, NgZone, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {DataService} from '../data-service';
import {HttpService} from '../http-service';
import {UserService} from '../user.service';

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.css']
})

export class GoogleSigninComponent {

  @Input()
  page: string;

  public name = 'Not Logged in!';

  public content: any = '';
  public user: any = '';
  public profile: any = '';

  @ViewChild('signInButton') signInButton;
  @ViewChild('signOutButton') signOutButton;

  constructor(private element: ElementRef, private http: HttpService,
              private router: Router, private _ngZone: NgZone,
              private dataService: DataService,
              private userService: UserService) {

    this.userService.userData.filter(e => !!e).subscribe(user => {
      console.log(user);
      this.router.navigate(['/main']);
    });
  }

  initLogin() {
    this.userService.signIn();
  }

}
