import {Action, createReducer, on} from '@ngrx/store';
import * as toastActions from '../actions';
import {IToastState} from '../states';

export const toastInitialState: IToastState = {
  isOpen: false,
  data: {}
};


const reducer = createReducer(
  toastInitialState,
  on(toastActions.openToastAction, (state, {data}) => {
    return {...state, isOpen: true, data};
  }),
  on(toastActions.closeToastAction, (state) => {
    return {...state, isOpen: false, data: {}};
  })
);

export function toastReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
