import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as accountsActions from '../actions/accounts.actions';
import * as nestedStates from '../actions';
import * as roleActions from '../actions';
import {catchError, concatMap, map, switchMap, take} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {PostRoleProps} from '../states';
import {getCountAccounts} from '../nested-states/count-accounts/actions';
import {User} from '../../../models/User';
import {forkJoin, of} from 'rxjs';

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
            return roleActions.getMoreAdmins();
          } else if (action.role === '_profile_teacher') {
            return roleActions.getMoreTeachers();
          } else if (action.role === '_profile_assistant') {
            return roleActions.getMoreAssistants();
          } else if (action.role === '_profile_student') {
            return roleActions.getMoreStudents({role: action.role});
          }
          return action;
        })
      );
  });

  postAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.postAccounts),
        map((action: any) => {
          let props: PostRoleProps = {
            school_id: action.school_id,
            user: action.user,
            userType: action.userType,
            roles: action.roles
          };
          if (action.role === '' || action.role === '_all') {
            return accountsActions.postSelectedAccounts(props);
          } else if (action.role === '_profile_admin') {
            props = {...props, behalf: action.behalf};
            return roleActions.postAdmin(props);
          } else if (action.role === '_profile_teacher') {
            props = {...props, behalf: action.behalf};
            return roleActions.postTeacher(props);
          } else if (action.role === '_profile_student') {
            return roleActions.postStudent(props);
          } else if (action.role === '_profile_assistant') {
            props = {...props, behalf: action.behalf};
            return roleActions.postAssistant(props);
          }

          return action;
        })
      );
  });

  updateAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.updateAccounts),
        switchMap((action) => {
          const account = User.fromJSON(action.account);
          if (account.isAdmin() && account.isTeacher()) {
            return [
              nestedStates.updateAdminAccount({profile: action.account}),
              nestedStates.updateTeacherAccount({profile: action.account})
            ];
          } else if (account.isAdmin()) {
            return [nestedStates.updateAdminAccount({profile: action.account})];
          } else if (account.isTeacher()) {
            return [nestedStates.updateTeacherAccount({profile: action.account})];
          } else if (account.isStudent()) {
            return [nestedStates.updateStudentAccount({profile: action.account})];
          } else if (account.isAssistant()) {
            return [nestedStates.updateAssistantAccount({profile: action.account})];
          }
        })
      );
  });

  postSelectedAccounts$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.postSelectedAccounts),
        concatMap((action: any) => {
          return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles)
            .pipe(
              map(() => {
                return accountsActions.postSelectedAccountsSuccess();
              })
            );
        })
      );
  });

  postSelectedAccountsSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(accountsActions.postSelectedAccountsSuccess),
        map(() => {
          return getCountAccounts();
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

   addUserToProfile$ = createEffect(() => {
     return this.actions$
       .pipe(
         ofType(accountsActions.addUserToProfile),
         map((action: any) => {
            if (action.role === 'admin') {
              return nestedStates.addUserToAdminProfile({user: action.user, role: action.role});
            } else if (action.role === 'teacher') {
              return nestedStates.addUserToTeacherProfile({user: action.user, role: action.role});
            } else if (action.role === 'student') {
              return nestedStates.addUserToStudentProfile({user: action.user, role: action.role});
            } else if (action.role === 'assistant') {
              return nestedStates.addUserToAssistantProfile({user: action.user, role: action.role});
            }
         })
       );
   });

   bulkAddAccounts$ = createEffect(() => {
     return this.actions$
       .pipe(
         ofType(accountsActions.bulkAddAccounts),
         concatMap((action: any) => {
           return this.userService.addBulkAccounts(action.accounts)
             .pipe(
               map((users: User[]) => {
                 return accountsActions.bulkAddAccountsSuccess({accounts: users});
               }),
              catchError(error => of(accountsActions.bulkAddAccountsFailure({errorMessage: error.message})))
             );
         })
       );
   });

   bulkAddAccountsSuccess$ = createEffect(() => {
     return this.actions$
       .pipe(
         ofType(accountsActions.bulkAddAccountsSuccess),
         switchMap((action: any) => {
           const accounts: {admins: User[], teachers: User[], students: User[], assistants: User[]} = {
             admins: [],
             teachers: [],
             students: [],
             assistants: []
           };
           action.accounts.forEach(account => {
             if (User.fromJSON(account).isAdmin()) {
               accounts.admins.push(account);
             }
             if (User.fromJSON(account).isTeacher()) {
               accounts.teachers.push(account);
             }
             if (User.fromJSON(account).isStudent()) {
               accounts.students.push(account);
             }
             if (User.fromJSON(account).isAssistant()) {
               accounts.assistants.push(account);
             }
           });
           return [
             nestedStates.bulkAddAdminAccounts({admins: accounts.admins}),
             nestedStates.bulkAddTeacherAccounts({teachers: accounts.teachers}),
             nestedStates.bulkAddStudentAccounts({students: accounts.students}),
             nestedStates.bulkAddAssistantAccounts({assistants: accounts.assistants})
           ];
         })
       );
   });

   sortAccounts$ = createEffect(() => {
     return this.actions$
       .pipe(
         ofType(accountsActions.sortAccounts),
         switchMap(action => {
           return forkJoin({
             action: of(action),
             limit: this.userService.countAccounts$[action.role].pipe(take(1))
           });
         }),
         concatMap(({action, limit}) => {
           const queryParams = {...action.queryParams, limit};
           return this.userService.sortTableHeader(queryParams)
             .pipe(
               map(({next, results}) => {
                 const sortValue = action.queryParams.sort ? action.queryParams.sort.includes('-') ? 'desc' : 'asc' : '';
                 return accountsActions.sortAccountsSuccess({users: results, role: action.role, next, sortValue});
               }),
               catchError(error => of(accountsActions.sortAccountsFailure({errorMessage: error.message})))
             );
         })
       );
   });

   sortAccountsSuccess$ = createEffect(() => {
     return this.actions$
       .pipe(
         ofType(accountsActions.sortAccountsSuccess),
         map(({users, role, next, sortValue}) => {
           const nextUrl = next ? next.substring(next.search('v1')) : null;
           if (role === '_profile_admin') {
             return nestedStates.sortAdminAccounts({admins: users, next: nextUrl, sortValue});
           } else if (role === '_profile_teacher') {
             return nestedStates.sortTeacherAccounts({teachers: users, next: nextUrl, sortValue});
           } else if (role === '_profile_student') {
             return nestedStates.sortStudentAccounts({students: users, next: nextUrl, sortValue});
           } else if (role === '_profile_assistant') {
             return nestedStates.sortAssistantAccounts({assistants: users, next: nextUrl, sortValue});
           }
         })
       );
   });

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
