import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LiveDataService, PassFilterType } from '../../../../../live-data/live-data.service';
import * as futurePassesActions from '../actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HallPass } from '../../../../../models/HallPass';
import { of } from 'rxjs';

@Injectable()
export class FuturePassesEffects {
	getFuturePasses$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(futurePassesActions.getFuturePasses),
			switchMap((action: any) => {
				const regexp = /\/main\/student\/\d+/;
				const filter = regexp.test(window.location.href)
					? undefined
					: action.user.roles.includes('hallpass_student')
					? { type: 'student', value: action.user }
					: { type: 'issuer', value: action.user };

				return this.liveDataService.watchFutureHallPasses(filter as PassFilterType).pipe(
					map((futurePasses: HallPass[]) => {
						return futurePassesActions.getFuturePassesSuccess({ futurePasses });
					}),
					catchError((error) => of(futurePassesActions.getFuturePassesFailure({ errorMessage: error.message })))
				);
			})
		);
	});

	constructor(private actions$: Actions, private liveDataService: LiveDataService) {}
}
