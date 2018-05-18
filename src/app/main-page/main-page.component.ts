import { Component, OnInit, ViewChild, ElementRef, Input, Output, Inject} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { Pass } from '../models';
import { PendingPass } from '../models';
import { HallPassListComponent } from '../hall-pass-list/hall-pass-list.component';
import { IssuedPassListComponent } from '../issued-pass-list/issued-pass-list.component';
import { PendingPassListComponent } from '../pending-pass-list/pending-pass-list.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
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
  @ViewChild(IssuedPassListComponent) issuedPassListComponent: IssuedPassListComponent;
  @ViewChild(PendingPassListComponent) pendingPassListComponent: PendingPassListComponent;

//------------------------NEW STUFF----------------------//

  formVisible: boolean

  constructor(private http: HttpService, private dataService: DataService, private router: Router, public dialog: MatDialog) {

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

  showForm(): void {
    let dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px',
      //data: { name: "Test1", animal: "Test2" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log();
      //this.animal = result;
    });
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
      if(!this.isStaff)
        this.hallPassListComponent.updatePasses();
      else
        this.issuedPassListComponent.updatePasses();
    } else if(this.selectedIndex == 2){
      if(!this.isStaff){
        this.pendingPassListComponent.updatePasses();
      }
    }
  }
}
// @Component({
//   selector: 'dialog-overview-example-dialog',
//   templateUrl: 'dialog-overview-example-dialog.html',
// })
// export class DialogOverviewExampleDialog {

//   constructor(
//     public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: any) { }

//   onNoClick(): void {
//     this.dialogRef.close();
//   }

// }