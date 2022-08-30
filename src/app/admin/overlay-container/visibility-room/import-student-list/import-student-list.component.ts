import {Component, ElementRef, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-student-list',
  templateUrl: './import-student-list.component.html',
  styleUrls: ['./import-student-list.component.scss']
})
export class ImportStudentListComponent implements OnInit, OnDestroy {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file', { static: true }) fileRef: ElementRef;

  destroy$ = new Subject();
  constructor() { }

  ngOnInit(): void {
    fromEvent(this.fileRef.nativeElement, 'change').pipe(
      switchMap(_ => {
        const fr = new FileReader();
        fr.readAsBinaryString(this.fileRef.nativeElement.files[0]);
        return fromEvent(fr, 'load');
      }),
      map((evt: ProgressEvent) => {
        console.log(evt);
        // TODO check is right type of file?
        // create a workbook
        const wb = XLSX.read(evt.target.result, {type: 'binary'}); 
      }),
      //takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

