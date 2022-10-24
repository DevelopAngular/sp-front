import { Component, OnInit } from '@angular/core';

declare const window;

@Component({
  selector: 'app-parent-page',
  templateUrl: './parent-page.component.html',
  styleUrls: ['./parent-page.component.scss']
})
export class ParentPageComponent implements OnInit {

  navbarHeight: string = '64px';
  hideNavbar: boolean;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      window.appLoaded();
    }, 700);

    if (window.location.toString().includes("auth")) {
      this.hideNavbar = true;
    }else {
      this.hideNavbar = false;
    }
  }

}
