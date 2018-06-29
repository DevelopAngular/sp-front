import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DataService } from '../data-service';
import { GoogleLoginService } from '../google-login.service';
import { LoadingService } from '../loading.service';
import { User } from '../NewModels';
import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {

  @Input()
  user: User;

  @Input()
  forTeacher: boolean;

  @Output() onTabChange: EventEmitter<number> = new EventEmitter();
  @Output() inboxEvent: EventEmitter<boolean> = new EventEmitter();

  tabIndex: number = 1;
  inboxVisibility: boolean = false;

  constructor(private dataService: DataService, public dialog: MatDialog, private router: Router,
              public loadingService: LoadingService, public loginService: GoogleLoginService) {
  }

  ngAfterViewInit() {

  }

  showOptions() {
    const dialogRef = this.dialog.open(OptionsComponent, {
      width: '100px',
      position: {top: '67px', right: '10px'},
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result === 'settings') {

      } else if (result === 'logout') {
        this.router.navigate(['/sign-out']);
      }
    });
  }

  getNavElementBg(index: number, type: string) {
    return type == 'btn' ? (index == this.tabIndex ? 'rgba(165, 165, 165, 0.3)' : '') : (index == this.tabIndex ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 255, 255, 0)');
  }

  updateTab(index: number) {
    this.tabIndex = index;
    this.onTabChange.emit(this.tabIndex);
  }

  inboxClick(){
    console.log('[Nav Inbox Toggle]', this.inboxVisibility);
    this.inboxVisibility = !this.inboxVisibility;
    this.inboxEvent.emit(this.inboxVisibility);
  }
}
