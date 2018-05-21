import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../data-service';
import { User } from '../NewModels';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit  {

  user: User = new User("", null, null, "", "", "John Doe", "", [""]);
  constructor(private dataService: DataService) { }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.dataService.currentUser.subscribe(user => {this.user = user});
    // console.log("[User]: ", this.user);
  }

}
