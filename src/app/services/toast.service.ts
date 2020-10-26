import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {getDataToast, getIsOpenToast} from '../ngrx/toast/states';
import {Observable, Subject} from 'rxjs';
import {closeToastAction, openToastAction} from '../ngrx/toast/actions';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  isOpen$: Observable<boolean> = this.store.select(getIsOpenToast);
  data$: Observable<any> = this.store.select(getDataToast);

  toastButtonClick$: Subject<string> = new Subject<string>();

  constructor(private store: Store<AppState>) { }

  openToast(data) {
    this.store.dispatch(openToastAction({data}));
  }

  closeToast() {
    this.store.dispatch(closeToastAction());
  }
}
