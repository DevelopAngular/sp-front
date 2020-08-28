import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  updateTableColumns$: Subject<string[]> = new Subject<string[]>();

  constructor() { }
}
