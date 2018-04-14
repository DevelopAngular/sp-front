import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @ViewChild('signOutButton') signInButton;

  constructor(private userService:UserService) { }

  ngOnInit() {
  }

  signOut(){
    console.log("Signing out");
    this.userService.signOut();
  }
}
