import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  updateTableHeaders$:
    Subject<{index: number, value: boolean, column: string}>
    = new Subject<{index: number, value: boolean, column: string}>();

  constructor() { }
}
