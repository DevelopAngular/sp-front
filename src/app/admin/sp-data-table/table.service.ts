import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';


export interface TableFilterOption {
  text: string;
  label: string;
  roles: Array<'_profile_student' | '_profile_teacher' | '_profile_admin' | '_profile_assistant' | '_profile_parent'>;
  filterCallback(account: any): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TableService {

  updateTableColumns$: Subject<string[]> = new Subject<string[]>();
  selectRow: Subject<any> = new Subject<any>();
  clearSelectedUsers: Subject<any> = new Subject<any>();
  loadingCSV$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAllSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  activeFilters$: BehaviorSubject<Record<string, TableFilterOption>> = new BehaviorSubject({});

  constructor() { }
}
