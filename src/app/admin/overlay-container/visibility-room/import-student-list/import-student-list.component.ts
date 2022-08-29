import {Component, ElementRef, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-import-student-list',
  templateUrl: './import-student-list.component.html',
  styleUrls: ['./import-student-list.component.scss']
})
export class ImportStudentListComponent implements OnInit, OnDestroy {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file', { static: true }) set fileRef(fileRef: ElementRef) {
    if (!fileRef?.nativeElement) {return;}

    fromEvent(fileRef.nativeElement, 'change').pipe(
      tap(v => console.log(v)),
      takeUntil(this.destroy$)
    )
  }

  destroy$ = new Subject();
  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

