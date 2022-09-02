import {Component, ElementRef, OnInit, OnDestroy, ViewChild, Optional, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Subject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';
import * as XLSX from 'xlsx';

import {User} from '../../../../models/User';
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
  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<ImportStudentListComponent>,
  ) { }

  ngOnInit(): void {
    // reset bvalue to upload same file
    fromEvent(this.fileRef.nativeElement, 'click').pipe(tap((evt: Event) => {
      (evt.target as HTMLInputElement).value = '';
    })).subscribe();

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
        const workbook = XLSX.read((evt.target as FileReader).result, {type: 'binary'}); 
        const name = workbook.SheetNames[0];
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1, blankrows: false});
        return data.map(r => r[0]);
      }),
      switchMap((emails: string[]) => {
        return this.userService.listOf({email: emails});
      }),
      tap((users: User[]) => {
        this.dialogRef.close(users);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

