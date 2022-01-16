import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as exclusionGroupsActions from '../actions';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {EncounterPreventionService} from '../../../../services/encounter-prevention.service';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import {of} from 'rxjs';
import * as toast from '../../../toast/actions';

@Injectable()
export class ExclusionGroupsEffects {

  getExclusionGroups$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.getExclusionGroups),
        mergeMap((action) => {
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

  getExclusionGroupsRorStudent$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(exclusionGroupsActions.getExclusionGroupsForStudent),
        mergeMap((action: any) => {
          return this.encounterPreventionService.getExclusionGroups({student: action.id})
            .pipe(
              map((groups: ExclusionGroup[]) => {
                return exclusionGroupsActions.getExclusionGroupsForStudentSuccess({groups, studentId: action.id});
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
              switchMap((group: ExclusionGroup) => {
                return [
                  exclusionGroupsActions.createExclusionGroupSuccess({group}),
                  toast.openToastAction({data: {
                    title: 'Encounter prevention group created',
                    subtitle: 'Encounter prevention has been enabled.',
                    type: 'success'
                  }})
                ];
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
              switchMap(() => {
                return [
                  exclusionGroupsActions.removeExclusionGroupSuccess({group: action.group}),
                  toast.openToastAction({data: {
                    title: 'Encounter prevention group deleted',
                    type: 'error'
                  }})
                ];
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
