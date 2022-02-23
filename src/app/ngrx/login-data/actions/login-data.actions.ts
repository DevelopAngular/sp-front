import {createAction, props} from '@ngrx/store';
import {LoginDataQueryParams} from '../../../models/LoginDataQueryParams';

const LOGIN = 'LOGIN';

export const setQueryParamsAction = createAction(`[${LOGIN}] Set Query Params`, props<{queryParams: LoginDataQueryParams}>());

export const setUrlAfterLogin = createAction(`[${LOGIN}] Set Url After Login`, props<{url: string}>());
