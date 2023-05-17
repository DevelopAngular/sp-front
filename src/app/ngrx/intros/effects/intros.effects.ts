import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as introsActions from '../actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { of } from 'rxjs';
import { updateIntrosShowAsOriginRoomSuccess } from '../actions';

@Injectable()
export class IntrosEffects {
	getIntros$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.getIntros),
			switchMap(() => {
				return this.userService.getIntros().pipe(
					map((intros) => {
						return introsActions.getIntrosSuccess({ data: intros });
					}),
					catchError((error) => of(introsActions.getIntrosFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	// TODO: Create a function that creates effects
	// The only thing that changes in most of these is a simple object key
	// Definitely lots of room for refactoring here
	updateIntrosMain$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosMain),
			switchMap((action) => {
				return this.userService.updateIntros(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							main_intro: {
								...action.intros.main_intro,
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosMainSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosMainFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntros$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntros),
			switchMap((action) => {
				return this.userService.updateIntrosReferral(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							referral_reminder: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosEncounter$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosEncounter),
			switchMap((action) => {
				return this.userService.updateIntrosEncounter(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							encounter_reminder: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosEncounterSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosEncounterFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosSearch$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosSearch),
			switchMap((action) => {
				return this.userService.updateIntrosSearch(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							search_reminder: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosSearchSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosSearchFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosHelpCenter$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosHelpCenter),
			switchMap((action) => {
				return this.userService.updateIntrosHelpCenter(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							frontend_help_center: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosHelpCenterSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosHelpCenterFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosDisableRoom$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosDisableRoom),
			switchMap((action) => {
				return this.userService.updateIntrosDisableRoom(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							disable_room_reminder: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosDisableRoomSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosDisableRoomFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntroStudentPassLimit$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosStudentPassLimits),
			switchMap((action) => {
				return this.userService.updateIntrosStudentPassLimit(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							student_pass_limit: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosStudentPassLimitsSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosStudentPassLimitsFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntroShowAsOriginRoom$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosShowRoomAsOrigin),
			switchMap((action) => {
				return this.userService.updateIntrosShowRoomAsOrigin(action.device, action.version).pipe(
					map((data) => {
						const updatedData = {
							...action.intros,
							show_as_origin_room: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosShowAsOriginRoomSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosShowRoomAsOriginFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntroAdminPassLimitsMessage$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosAdminPassLimitsMessage),
			switchMap((action) => {
				return this.userService.updateIntrosAdminPassLimitMessage(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							admin_pass_limit_message: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosAdminPassLimitsMessageSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosAdminPassLimitsMessageFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntroWaitInLine$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosWaitInLine),
			switchMap((action) => {
				return this.userService.updateIntrosWaitInLine(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							admin_pass_limit_message: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosWaitInLineSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosWaitInLineFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntroPassLimitOnlyCertainRoom$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosPassLimitsOnlyCertainRooms),
			switchMap((action) => {
				return this.userService.updateIntrosPassLimitsOnlyCertainRooms(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							admin_pass_limits_only_certain_rooms: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosPassLimitsOnlyCertainRoomsSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosPassLimitsOnlyCertainRoomsFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateSeenRenewalStatusPage$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosSeenRenewalStatusPage),
			switchMap((action) => {
				return this.userService.updateIntrosSeenRenewalStatusPage(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							seen_renewal_status_page: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosSeenRenewalStatusPageSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosSeenRenewalStatusPageFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosSeenReferralNux$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosSeenReferralNux),
			switchMap((action) => {
				return this.userService.updateIntrosSeenReferralNux(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							seen_referral_nux: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosSeenReferralNuxSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosSeenReferralNuxFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	updateIntrosSeenReferralSuccessNux$ = createEffect(() => {
		return this.action$.pipe(
			ofType(introsActions.updateIntrosSeenReferralSuccessNux),
			switchMap((action) => {
				return this.userService.updateIntrosSeenReferralSuccessNux(action.device, action.version).pipe(
					map(() => {
						const updatedData = {
							...action.intros,
							seen_referral_success_nux: {
								[action.device]: { seen_version: action.version },
							},
						};
						return introsActions.updateIntrosSeenReferralSuccessNuxSuccess({ data: updatedData });
					}),
					catchError((error) => of(introsActions.updateIntrosSeenReferralSuccessNuxFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	constructor(private action$: Actions, private userService: UserService) {}
}
