import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  gUser: any[];
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.currentGUser.subscribe(gUser => {this.gUser = gUser});
    console.log("[gUser]: ", this.gUser);
  }

}
