import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../models/User';
import {HttpService} from '../services/http-service';

declare const window;

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  public currentUser: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService
  ) { }

  ngOnInit() {
    window.appLoaded(2000);

  }
}
