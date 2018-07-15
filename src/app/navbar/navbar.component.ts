import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
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

export class NavbarComponent implements OnInit {

  isStaff: boolean;
  user: User;

  tab: string = 'passes';
  inboxVisibility: boolean = false;

  navbarEnabled = false;

  constructor(private dataService: DataService, public dialog: MatDialog, private router: Router,
              public loadingService: LoadingService, public loginService: GoogleLoginService, private _zone: NgZone) {

    const navbarEnabled$ = Observable.combineLatest(
      this.loadingService.isLoading$,
      this.loginService.isAuthenticated$,
      (a, b) => a && b);

    navbarEnabled$.subscribe(s => {
      this._zone.run(() => {
        this.navbarEnabled = s;
      });
    });
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
          ;
        });
      });
  }

  get notifications() {
    return 1;
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
    //return type == 'btn' ? (index == this.tabIndex ? 'rgba(165, 165, 165, 0.3)' : '') : (index == this.tabIndex ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 255, 255, 0)');
  }

  updateTab(route: string) {
    this.tab = route;
    this.router.navigateByUrl('/' + this.tab);
  }

  inboxClick() {
    console.log('[Nav Inbox Toggle]', this.inboxVisibility);
    this.inboxVisibility = !this.inboxVisibility;
    this.dataService.updateInbox(this.inboxVisibility);
  }
}
