import { Component, OnInit } from '@angular/core';
import { GoogleLoginService } from '../../google-login.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

  constructor(public loginService: GoogleLoginService) {
  }

  ngOnInit() {
  }

}
