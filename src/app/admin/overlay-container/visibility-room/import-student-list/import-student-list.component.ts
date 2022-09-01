import {Component, ElementRef, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import {UserService} from '../../../../services/user.service';

@Component({
  selector: 'app-import-student-list',
  templateUrl: './import-student-list.component.html',
  styleUrls: ['./import-student-list.component.scss']
})
export class ImportStudentListComponent implements OnInit, OnDestroy {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file', { static: true }) fileRef: ElementRef;

  destroy$ = new Subject();
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const fr = new FileReader();

    // reset bvalue to upload same file
    fromEvent(this.fileRef.nativeElement, 'click').pipe(tap((evt: Event) => {
      (evt.target as HTMLInputElement).value = '';
    })).subscribe();

    fromEvent(this.fileRef.nativeElement, 'change').pipe(
      switchMap(_ => {
        fr.readAsBinaryString(this.fileRef.nativeElement.files[0]);
        return fromEvent(fr, 'load');
      }),
      map((evt: ProgressEvent) => {
        console.log(evt);
        // TODO check is right type of file?
        // create a workbook
        const workbook = XLSX.read((evt.target as FileReader).result, {type: 'binary'}); 
        const name = workbook.SheetNames[0];
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1, blankrows: false});
        return data.map(r => r[0]);
      }),
      switchMap((emails: string[]) => {
        return this.userService.listOf(['id'], {email: emails});
      }),

      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

