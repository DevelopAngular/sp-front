import { Component, OnInit } from '@angular/core';

declare const window;

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.scss']
})
export class DevelopmentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    window.appLoaded();
  }

}
