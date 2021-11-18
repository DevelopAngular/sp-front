import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as exclusionGroupsActions from '../actions';
import {catchError, exhaustMap, map, switchMap} from 'rxjs/operators';
import {EncounterPreventionService} from '../../../../services/encounter-prevention.service';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import {of} from 'rxjs';

@Injectable()
export class ExclusionGroupsEffects {

  getExclusionGroups$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.getExclusionGroups),
        exhaustMap((action) => {
          return this.encounterPreventionService.getExclusionGroups(action.queryParams)
            .pipe(
              map((groups: ExclusionGroup[]) => {
                return exclusionGroupsActions.getExclusionGroupsSuccess({groups});
              }),
              catchError(error => of(exclusionGroupsActions.getExclusionGroupsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  createExclusionGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.createExclusionGroup),
        switchMap((action: any) => {
          return this.encounterPreventionService.createExclusionGroup(action.groupData)
            .pipe(
              map((group: ExclusionGroup) => {
                return exclusionGroupsActions.createExclusionGroupSuccess({group});
              }),
              catchError(error => of(exclusionGroupsActions.createExclusionGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateExclusionGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.updateExclusionGroup),
        switchMap((action: any) => {
          return this.encounterPreventionService.updateExclusionGroup(action.group, action.updateFields)
            .pipe(
              map((group: ExclusionGroup) => {
                debugger;
                return exclusionGroupsActions.updateExclusionGroupSuccess({group});
              }),
              catchError(error => of(exclusionGroupsActions.updateExclusionGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  removeExclusionGroup$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.removeExclusionGroup),
        switchMap((action) => {
          return this.encounterPreventionService.deleteExclusionGroup(action.group.id)
            .pipe(
              map(() => {
                return exclusionGroupsActions.removeExclusionGroupSuccess({group: action.group});
              }),
              catchError(error => of(exclusionGroupsActions.removeExclusionGroupFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private actions$: Actions,
    private encounterPreventionService: EncounterPreventionService
  ) {}
}
