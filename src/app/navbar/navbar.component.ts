import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../data-service';
import { User } from '../NewModels';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { OptionsComponent } from '../options/options.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit  {

  user: User = new User("", null, null, "", "", "John Doe", "", [""]);
  constructor(private dataService: DataService, public dialog: MatDialog, private userService:UserService) { }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.dataService.currentUser.subscribe(user => {this.user = user});
  }

  showOptions(){
    let dialogRef = this.dialog.open(OptionsComponent, {
      width: '100px',
      position: {top: "67px", right: "10px"},
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if(result == 'settings'){

      } else if(result == 'logout'){
        this.userService.signOut();
      }
    });
  }
}
