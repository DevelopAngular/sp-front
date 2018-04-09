import { Component, OnInit, ViewChild, ElementRef, Input, Output} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import {Pass} from '../models';
import {PendingPass} from '../models';
import { HallPassListComponent } from '../hall-pass-list/hall-pass-list.component';
declare var document: any;

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})

export class MainPageComponent implements OnInit {
  @Input()
  selectedIndex: any;

  private barer: string;
  private gUser: any;
  private user: any;
  public isStaff = false;
  activePasses: Pass[] = [];
  expiredPasses: Pass[] = [];
  templates: PendingPass[] = [];
  show = false;
  currentOffset = 0;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild(HallPassListComponent) hallPassListComponent: HallPassListComponent;

  constructor(private http: HttpService, private dataService: DataService, private router: Router) {

  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.dataService.currentTab.subscribe(selectedIndex => this.selectedIndex = selectedIndex);
    if (this.barer == '')
      this.router.navigate(['../']);
    else{
      this.dataService.currentUser.subscribe(user => this.user = user);
      this.isStaff = this.user.roles.includes('edit_all_hallpass');
    }
  }

  toTop(){
    //console.log("Going to top.");
    try {
      const interval = setInterval(() => {
        if (!(document.scrollingElement.scrollTop < 1))
          document.scrollingElement.scrollTop = document.scrollingElement.scrollTop - document.scrollingElement.scrollTop / 10;
        else
          clearInterval(interval);
      }, 15);
    } catch (err) {
      console.log('Error: ' + err);
    }
  }

  tabChange(){
    if (this.selectedIndex == 1){
      console.log("Updating Passes.");
      this.hallPassListComponent.updatePasses();
    }
  }
}
