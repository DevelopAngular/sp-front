import {AfterViewInit, Component, OnInit} from '@angular/core';

declare const window;

@Component({
  selector: 'app-accounts-setup',
  templateUrl: './accounts-setup.component.html',
  styleUrls: ['./accounts-setup.component.scss']
})
export class AccountsSetupComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    window.appLoaded();
  }
}
