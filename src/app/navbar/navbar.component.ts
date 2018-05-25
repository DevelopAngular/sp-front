import { AfterViewInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data-service';
import { User } from '../NewModels';
import { MatDialog } from '@angular/material';
import { OptionsComponent } from '../options/options.component';
import { Router } from '@angular/router';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit {

  @Input()
  user:User;

  @Input()
  forTeacher: boolean;

  @Output() onTabChange:EventEmitter<number> = new EventEmitter();

  tabIndex: number = 1;
  // user: User = new User('', null, null, '', '', '', '', ['']);

  constructor(private dataService: DataService, public dialog: MatDialog, private router: Router, public loadingService: LoadingService) {
  }

  ngAfterViewInit() {
    // this.dataService.currentUser.subscribe(user => {
    //   this.user = user;
    // });
  }

  showOptions() {
    const dialogRef = this.dialog.open(OptionsComponent, {
      width: '100px',
      position: {top: '67px', right: '10px'},
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result === 'settings') {

      } else if (result === 'logout') {
        this.router.navigate(['/sign-out']);
      }
    });
  }

  getNavElementBg(index:number, type:string){
    return type=='btn'?(index==this.tabIndex?'rgba(165, 165, 165, 0.3)':''):(index==this.tabIndex?'rgba(0, 255, 0, 1)':'rgba(255, 255, 255, 0)');
  }

  updateTab(index:number){
    this.tabIndex = index;
    this.onTabChange.emit(this.tabIndex);
  }
}
