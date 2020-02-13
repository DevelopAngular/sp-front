import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as accountsActions from '../actions/accounts.actions';
import * as roleActions from '../actions';
import {concatMap, map} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/User';
import {createAction} from '@ngrx/store';

@Injectable()
export class AccountsEffects {
  getAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.getAccounts),
        map((action: any) => {
          if (action.role === '' || action.role === '_all') {
            return roleActions.getAllAccounts({role: action.role, search: action.search, limit: action.limit})
          } else if (action.role === '_profile_admin') {
            return roleActions.getAdmins({role: action.role, search: action.search, limit: action.limit});
          } else if (action.role === '_profile_teacher') {
            return roleActions.getTeachers({role: action.role, search: action.search, limit: action.limit});
          } else if (action.role === '_profile_assistant') {
            return roleActions.getAssistants({role: action.role, search: action.search, limit: action.limit});
          } else if (action.role === '_profile_student') {
            return roleActions.getStudents({role: action.role, search: action.search, limit: action.limit});
          }
          return action;
        })
      );
  });

  getMoreAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.getMoreAccounts),
        map((action: any) => {
          if (action.role === '' || action.role === '_all') {
            return roleActions.getMoreAccounts({role: action.role});
          } else if (action.role === '_profile_admin') {
            return roleActions.getMoreAccounts({role: action.role});
          } else if (action.role === '_profile_teacher') {
            return roleActions.getTeachers({role: action.role, search: action.search, limit: action.limit});
          } else if (action.role === '_profile_assistant') {
            return roleActions.getAssistants({role: action.role, search: action.search, limit: action.limit});
          } else if (action.role === '_profile_student') {
            return roleActions.getStudents({role: action.role, search: action.search, limit: action.limit});
          }
          return action;
        })
      );
  });

  postAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.postAccounts),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              map((user: User) => {
                    return roleActions.postAdminSuccess({admin: user});
              })
            );
        })
      );
  });

  removeAccount$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.removeAccount),
        map((action: any) => {
          if (action.role === '' || action.role === '_all') {
            return roleActions.removeAllAccount({id: action.id});
          } else if (action.role === '_profile_admin') {
            return roleActions.removeAdminAccount({id: action.id});
          } else if (action.role === '_profile_teacher') {
            return roleActions.removeTeacher({id: action.id});
          } else if (action.role === '_profile_student') {
            return roleActions.removeStudent({id: action.id});
          } else if (action.role === '_profile_assistant') {
            return roleActions.removeAssistant({id: action.id});
          }

          return action;
        })
      );
  });

  updateAccountActivity$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.updateAccountActivity),
        map((action: any) => {
          if (action.role === '_profile_teacher') {
            return roleActions.updateTeacherActivity({profile: action.profile, active: action.active});
          } else if (action.role === '_profile_student') {
            return roleActions.updateStudentActivity({profile: action.profile, active: action.active});
          } else if (action.role === '_profile_assistant') {
            return roleActions.updateAssistantActivity({profile: action.profile, active: action.active});
          } else if (action.role === '_profile_admin') {
            return roleActions.updateAdminActivity({profile: action.profile, active: action.active});
          }

          return action;
        })
      );
  });

  updateAccountPermissions$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.updateAccountPermissions),
        map((action: any) => {
          if (action.role === '_profile_teacher') {
            return roleActions.updateTeacherPermissions({profile: action.profile, permissions: action.permissions});
          } else if (action.role === '_profile_admin') {
            return roleActions.updateAdminPermissions({profile: action.profile, permissions: action.permissions});
          } else if (action.role === '_profile_assistant') {
            return roleActions.updateAssistantPermissions({profile: action.profile, permissions: action.permissions});
          }
        })
      );
  });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
