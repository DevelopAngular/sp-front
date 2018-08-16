import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleLoginService } from '../google-login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private loginService: GoogleLoginService, private router: Router) {

    this.loginService.isAuthenticated$
      .filter(v => v)
      .take(1)
      .subscribe(value => {
        this.router.navigate(['main/passes']);
      });

  }

  ngOnInit() {
  }

}
