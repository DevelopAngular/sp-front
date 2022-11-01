import { AfterViewInit, Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { combineLatest, Subject } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";
import { User } from "../../models/User";
import { RepresentedUser } from "../../navbar/navbar.component";
import { DataService } from "../../services/data-service";
import { HttpService } from "../../services/http-service";
import { ParentAccountService } from "../../services/parent-account.service";
import { UserService } from "../../services/user.service";
import { ParentInviteCodeDialogComponent } from "../parent-invite-code-dialog/parent-invite-code-dialog.component";

declare const window;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  user: User;
  private destroyer$ = new Subject<any>();
  studentsList: User[] = [];

  constructor(
    private matDialog: MatDialog,
    private http: HttpService,
    public userService: UserService,
    private dataService: DataService,
    private parentService: ParentAccountService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getStudents();
    this.getParentInfo();
    if (localStorage.getItem("open-invite-student")) {
      this.openInviteFamiliesDialog();
      localStorage.removeItem("open-invite-student");
    }
  }

  ngAfterViewInit() {}

  openInviteFamiliesDialog() {
    const dialogRef = this.matDialog.open(ParentInviteCodeDialogComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if (result) {
        this.getStudents();
      // }
    });
    // const dialogRef = this.matDialog.open(InviteFamiliesDialogComponent, {
    //   panelClass: 'accounts-profiles-dialog',
    //   backdropClass: 'custom-bd',
    //   width: '425px',
    //   height: '480px',
    // });
  }

  getParentInfo() {
    this.parentService.getParentInfo().subscribe({
      next: (result: any) => {
        this.user = result;
      },
      error: (error: any) => {
        console.log("Error : ", error)

      }
    });
  }

  getStudents() {
    this.parentService.getStudents().subscribe({
      next: (result: any) => {
        console.log("result : ", result);
        if (result?.results) {
          this.studentsList = result?.results;
        }
      },
      error: (error: any) => {
        console.log("Error : ", error);
      },
    });
  }

  goToStudent(value) {
    this.router.navigateByUrl(`/parent/student/${value.id}`);
  }
}
