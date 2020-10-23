import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  updateTableColumns$: Subject<string[]> = new Subject<string[]>();
  selectRow: Subject<any> = new Subject<any>();
  clearSelectedUsers: Subject<any> = new Subject<any>();
  loadingCSV$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }
}
