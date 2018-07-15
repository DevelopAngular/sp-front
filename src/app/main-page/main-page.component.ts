import { Component, OnInit } from '@angular/core';

import 'rxjs/add/operator/map';
import { GoogleLoginService } from '../google-login.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(public loginService: GoogleLoginService) {
  }

  ngOnInit() {
  }
}
