import { Component, OnInit } from '@angular/core';
import {User} from '../models/User';

declare const window;

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  public currentUser: User;

  constructor(
  ) { }

  ngOnInit() {
    window.appLoaded(2000);

  }
}
