import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpService } from '../services/http-service';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { School } from '../models/School';

@Component({
  selector: 'app-my-profile-dialog',
  templateUrl: './my-profile-dialog.component.html',
  styleUrls: ['./my-profile-dialog.component.scss']
})
export class MyProfileDialogComponent implements OnInit {

  public user$: Observable<User>;
  public schools$: Observable<School[]>;

  constructor(
    private userService: UserService,
    private http: HttpService
  ) { }

  ngOnInit() {
    this.user$ = this.userService.user$;
    this.schools$ = this.http.schoolsCollection$;
  }

  checkAccountType(account: User) {
    if (account.sync_types.indexOf('google') !== -1) {
      return 'Connected with G Suite';
    } else if (account.sync_types.indexOf('gg4l') !== -1) {
      return 'Connected with GG4L';
    } else if (!account.sync_types.length) {
      return 'Standard account';
    }
  }

  checkUserRoles(roles: string[]) {
    return roles.reduce((acc, currRole) => {
      if (currRole === '_profile_admin') {
        return [...acc, 'Admin'];
      } else if (currRole === '_profile_teacher') {
        return [...acc, 'Teacher'];
      } else if (currRole === '_profile_student') {
        return [...acc, 'Student'];
      } else if (currRole === '_profile_assistant') {
        return [...acc, 'Assistant'];
      }
      return [...acc];
    }, []).join(', ');
  }

}
