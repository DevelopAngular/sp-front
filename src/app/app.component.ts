import { Component, NgZone, OnInit } from '@angular/core';
import { GoogleLoginService } from './google-login.service';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  isAuthenticated = false;

  constructor(public loginService: GoogleLoginService, private _zone: NgZone) {
  }

  ngOnInit() {
    this.loginService.isAuthenticated$.subscribe(t => {
      this._zone.run(() => {
        this.isAuthenticated = t;
      });
    });
  }


}
