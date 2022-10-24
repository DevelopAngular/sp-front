import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { InviteFamiliesDialogComponent } from '../../admin/invite-families-dialog/invite-families-dialog.component';
import { User } from '../../models/User';
import { RepresentedUser } from '../../navbar/navbar.component';
import { DataService } from '../../services/data-service';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { ParentInviteCodeDialogComponent } from '../parent-invite-code-dialog/parent-invite-code-dialog.component';

declare const window;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  user: User;
  private destroyer$ = new Subject<any>();
  student: User[] = [];

  constructor(
    private matDialog: MatDialog,
    private http: HttpService,
    public userService: UserService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('open-invite-student')) {
      this.openInviteFamiliesDialog();
      localStorage.removeItem('open-invite-student');
    }

    this.http.globalReload$
      .pipe(
        switchMap(() => {
          return combineLatest([
            this.userService.effectiveUser,
            this.userService.user$.pipe(filter((u) => !!u)),
          ]);
        }),
        takeUntil(this.destroyer$),
        switchMap(([eu, user]: [RepresentedUser, User]) => {
          this.user = User.fromJSON(user);
          console.log("User : ", this.user)
            return this.dataService.getLocationsWithTeacher(user);
        })
      )
      .subscribe((locs): void => {
      });
  }

  ngAfterViewInit() {
  }

  openInviteFamiliesDialog(){
    const dialogRef = this.matDialog.open(ParentInviteCodeDialogComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
    });
    // const dialogRef = this.matDialog.open(InviteFamiliesDialogComponent, {
    //   panelClass: 'accounts-profiles-dialog',
    //   backdropClass: 'custom-bd',
    //   width: '425px',
    //   height: '480px',
    // });
  }

}
