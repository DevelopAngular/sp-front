import { Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as toastActions from '../actions';
import {map} from 'rxjs/operators';


@Injectable()
export class ToastEffects {

  constructor(private actions$: Actions) {
  }
}
