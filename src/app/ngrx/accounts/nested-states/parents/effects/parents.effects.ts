import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../../../../../services/user.service';
import * as parentsActions from '../actions';
import { catchError, concatMap, exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { User } from '../../../../../models/User';
import { of } from 'rxjs';
import { HttpService } from '../../../../../services/http-service';
import { getCountAccounts } from '../../count-accounts/actions';
import { UserStats } from '../../../../../models/UserStats';
import { HallPass } from '../../../../../models/HallPass';

@Injectable()
export class ParentsEffects {
	getParents$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.getParents),
			exhaustMap((action: any) => {
				console.log(action);
				return this.userService.getUsersList(action.role, action.search, action.limit).pipe(
					map((users: any) => {
						const nextUrl = users.next ? users.next.substring(users.next.search('v1')) : null;
						return parentsActions.getParentsSuccess({ parents: users.results, next: nextUrl });
					}),
					catchError((error) => of(parentsActions.getParentsFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	getMoreParents$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.getMoreParents),
			concatMap((action: any) => {
				return this.userService.nextRequests$._profile_parent.pipe(take(1));
			}),
			// filter(res => !!res),
			switchMap((next) => {
				return this.http.get(next).pipe(
					map((moreParents: any) => {
						const nextUrl = moreParents.next ? moreParents.next.substring(moreParents.next.search('v1')) : null;
						return parentsActions.getMoreParentSuccess({ moreParents: moreParents.results, next: nextUrl });
					}),
					catchError((error) => {
						return of(parentsActions.getMoreParentsFailure({ errorMessage: error.message }));
					})
				);
			})
		);
	});

	postParent$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.postParent),
			concatMap((action: any) => {
				return this.userService.addAccountToSchool(action.school_id, action.user, action.userType, action.roles).pipe(
					map((parent: User) => {
						return parentsActions.postParentSuccess({ parent });
					})
				);
			})
		);
	});

	postParentSuccess$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.postParentSuccess),
			map(() => {
				return getCountAccounts();
			})
		);
	});

	removeParent$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.removeParent),
			concatMap((action: any) => {
				return this.userService.deleteUserFromProfile(action.id, 'parent').pipe(
					map((user) => {
						return parentsActions.removeParentSuccess({ id: action.id });
					}),
					catchError((error) => of(parentsActions.removeParentFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateParentActivity$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.updateParentActivity),
			concatMap((action: any) => {
				return this.userService.setUserActivity(action.profile.id, action.active).pipe(
					map((user) => {
						const profile = {
							...action.profile,
						};
						profile.active = action.active;
						return parentsActions.updateParentActivitySuccess({ profile });
					}),
					catchError((error) => of(parentsActions.updateParentActivityFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	addUserToParentProfile$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.addUserToParentProfile),
			concatMap((action: any) => {
				return this.userService.addUserToProfile(action.user.id, action.role).pipe(
					map((user) => {
						return parentsActions.addUserToParentProfileSuccess({ parent: action.user });
					}),
					catchError((error) => of(parentsActions.addUserToParentProfileFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	getParentStats$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(parentsActions.getParentStats),
			switchMap((action) => {
				return this.userService.getUserStats(action.userId, action.queryParams).pipe(
					map((stats: UserStats) => {
						return parentsActions.getParentStatsSuccess({
							userId: action.userId,
							stats: { ...stats, expired_passes: stats.expired_passes.map((pass) => HallPass.fromJSON(pass)) },
						});
					}),
					catchError((error) => {
						return of(parentsActions.getParentStatsFailure({ errorMessage: error.message }));
					})
				);
			})
		);
	});

	// addReportToStats$ = createEffect(() => {
	//   return this.actions$
	//     .pipe(
	//       ofType(parentsActions.addReportToStats),
	//       switchMap((action) => {
	//         return this.userService.parentsStats$.pipe(
	//           take(1),
	//           map(stats => {
	//             if (stats[action.report.parent.id]) {
	//               return parentsActions.addReportToStatsSuccess({report: action.report});
	//             } else {
	//               return parentsActions.addReportToStatsFailure({errorMessage: 'This user does`t have a stats now'});
	//             }
	//           })
	//         );
	//       })
	//     );
	// });

	constructor(private actions$: Actions, private userService: UserService, private http: HttpService) {}
}
