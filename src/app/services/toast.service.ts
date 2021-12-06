import {Injectable} from '@angular/core';

import {Store} from '@ngrx/store';
import {Observable, Subject} from 'rxjs';

import {Toast} from '../models/Toast';
import {AppState} from '../ngrx/app-state/app-state';
import {getDataToast, getIsOpenToast, getOpenedToasts} from '../ngrx/toast/states';
import {closeToastAction, getCurrentToastData, openToastAction} from '../ngrx/toast/actions';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  isOpen$: Observable<boolean> = this.store.select(getIsOpenToast);
  data$: Observable<any> = this.store.select(getDataToast);
  toasts$: Observable<any> = this.store.select(getOpenedToasts);

  toastButtonClick$: Subject<string> = new Subject<string>();

  constructor(private store: Store<AppState>) { }

  getToastDataById(id: string) {
    this.store.dispatch(getCurrentToastData({id}));
  }

  openToast(data: Toast, id?: string) {
    this.store.dispatch(openToastAction({data, id}));
  }

  closeToast(ids: string[] = []) {
    this.store.dispatch(closeToastAction({ids}));
  }
}
