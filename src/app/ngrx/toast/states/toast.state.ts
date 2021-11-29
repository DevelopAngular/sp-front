import {EntityState} from '@ngrx/entity';
import {Toast} from '../../../models/Toast';

export interface ToastObj {
  id: string;
  isOpen: boolean;
  data: Toast;
}

export interface IToastState extends EntityState<ToastObj> {
  loading: boolean;
  loaded: boolean;
  currentToastId: string;
}
