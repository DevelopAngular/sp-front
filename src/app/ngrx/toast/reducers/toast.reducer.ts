import {Action, createReducer, on} from '@ngrx/store';
import * as toastActions from '../actions';
import {IToastState, ToastObj} from '../states';
import {createEntityAdapter} from '@ngrx/entity';

export const adapter = createEntityAdapter<ToastObj>();

export const toastInitialState: IToastState = adapter.getInitialState({
  loaded: false,
  loading: false,
  currentToastId: null
});


const reducer = createReducer(
  toastInitialState,
  on(toastActions.openToastActionSuccess, (state, {data, id}) => {
    return adapter.addOne({id, data, isOpen: true}, {...state, currentToastId: id});
  }),
  on(toastActions.closeToastActionSuccess, (state, {ids}) => {
    return adapter.removeMany(ids, {...state});
  }),
  on(toastActions.closeAllToasts, (state) => {
    return adapter.removeAll({...state});
  })
);

export function toastReducer(state: any | undefined, action: Action) {
  return reducer(state, action);
}
