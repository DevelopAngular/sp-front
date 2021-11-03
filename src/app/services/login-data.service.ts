import {Injectable} from '@angular/core';
import {AppState} from '../ngrx/app-state/app-state';

import {Observable} from 'rxjs';

import {Store} from '@ngrx/store';
import {setQueryParamsAction} from '../ngrx/login-data/actions';
import {getLoginDataQueryParams} from '../ngrx/login-data/states';
import {LoginDataQueryParams} from '../models/LoginDataQueryParams';

@Injectable({
  providedIn: 'root'
})
export class LoginDataService {

  loginDataQueryParams: Observable<LoginDataQueryParams> = this.store.select(getLoginDataQueryParams);

  constructor(private store: Store<AppState>) { }

  setLoginDataQueryParams(queryParams) {
    this.store.dispatch(setQueryParamsAction({queryParams}));
  }
}
