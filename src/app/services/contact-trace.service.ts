import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {getContacts} from '../ngrx/contact-trace/actions';
import {Observable} from 'rxjs';
import {ContactTrace} from '../models/ContactTrace';
import {getContactTraceCollection, getContactTraceLoaded, getContactTraceLoading} from '../ngrx/contact-trace/states';

@Injectable({
  providedIn: 'root'
})
export class ContactTraceService {

  contactTraceData$: Observable<ContactTrace[]> = this.store.select(getContactTraceCollection);
  contactTraceLoading$: Observable<boolean> = this.store.select(getContactTraceLoading);
  contactTraceLoaded$: Observable<boolean> = this.store.select(getContactTraceLoaded);

  constructor(
    private http: HttpService,
    private store: Store<AppState>
  ) { }

  getContacts(studentIds: number[] | string[], start_time) {
    return this.http.post('v1/stats/contact_tracing', {students: studentIds, start_time});
  }

  getContactsRequest(studentsIds, start_time) {
    this.store.dispatch(getContacts({studentsIds, start_time}));
  }
}
