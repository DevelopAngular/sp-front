import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as introsActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {of} from 'rxjs';

@Injectable()
export class IntrosEffects {

  getIntros$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.getIntros),
        switchMap((action: any) => {
          return this.userService.getIntros()
            .pipe(
              map(intros => {
                return introsActions.getIntrosSuccess({data: intros});
              }),
              catchError(error => of(introsActions.getIntrosFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntrosMain$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntrosMain),
        switchMap((action) => {
          return this.userService.updateIntros(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  main_intro: {
                    ...action.intros.main_intro,
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosMainSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosMainFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntros$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntros),
        switchMap((action) => {
          return this.userService.updateIntrosReferral(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  referral_reminder: {
                  [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntrosEncounter$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntrosEncounter),
        switchMap((action) => {
          return this.userService.updateIntrosEncounter(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  encounter_reminder: {
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosEncounterSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosEncounterFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntrosSearch$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntrosSearch),
        switchMap((action) => {
          return this.userService.updateIntrosSearch(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  search_reminder: {
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosSearchSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosSearchFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntrosDisableRoom$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntrosDisableRoom),
        switchMap((action) => {
          return this.userService.updateIntrosDisableRoom(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  disable_room_reminder: {
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosDisableRoomSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosDisableRoomFailure({errorMessage: error.message})))
            );
        })
      );
  });

  updateIntroStudentPassLimit$ = createEffect(() => {
    return this.action$
      .pipe(
        ofType(introsActions.updateIntrosDisableRoom),
        switchMap((action) => {
          return this.userService.updateIntrosStudentPassLimit(action.device, action.version)
            .pipe(
              map(data => {
                const updatedData = {
                  ...action.intros,
                  disable_room_reminder: {
                    [action.device]: {seen_version: action.version}
                  }
                };
                return introsActions.updateIntrosStudentPassLimitsSuccess({data: updatedData});
              }),
              catchError(error => of(introsActions.updateIntrosStudentPassLimitsFailure({errorMessage: error.message})))
            );
        })
      );
  });

  constructor(
    private action$: Actions,
    private userService: UserService
  ) {}

}
