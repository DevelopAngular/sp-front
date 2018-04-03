import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';
import {RouterOutlet} from '@angular/router';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  constructor() {

  }

  ngOnInit(){

  }

}
