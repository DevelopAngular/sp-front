import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @ViewChild('signOutButton') signInButton;

  constructor() { }

  ngOnInit() {
  }

}
