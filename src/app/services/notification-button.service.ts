import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class NotificationButtonService {

  constructor() { }

  dismissButton$: Subject<boolean> = new Subject<boolean>();

  dismissExpirtationDate = moment().add(10, 'day');
}
