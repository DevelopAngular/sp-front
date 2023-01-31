import { EncounterDetectionService } from '../../../services/EncounterDetectionService';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EncounterDetection } from '../../../models/EncounterDetection';
import * as encounterDetectionActions from '../actions';

@Injectable()
export class EncounterDetectionEffects {
	constructor(private actions$: Actions, private EDService: EncounterDetectionService) {}

	EncounterDetection$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(encounterDetectionActions.getEncounterDetection),
			concatMap((action) => {
				return this.EDService.getEncounterDetectionFunction(action.url).pipe(
					map(({ results, created_at }) => {
						return encounterDetectionActions.getEncounterDetectionSuccess({ encounterDetection: results, createdAt: created_at });
					}),
					catchError((error) => {
						console.log(error);
						return of(encounterDetectionActions.getEncounterDetectionFailure({ errorMessage: error.message }));
					})
				);
			})
		);
	});
}
