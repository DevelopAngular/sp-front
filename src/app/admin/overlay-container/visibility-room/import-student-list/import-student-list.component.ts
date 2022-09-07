import {Component, ElementRef, OnInit, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Subject, Observable, BehaviorSubject, of} from 'rxjs';
import {tap, map, switchMap, takeUntil, catchError} from 'rxjs/operators';
import * as XLSX from 'xlsx';

import {User} from '../../../../models/User';
import {UserService} from '../../../../services/user.service';
import { SupportService } from '../../../../services/support.service';

interface buttonState {
  text: string;
  active: boolean;
  students?: User[];
}

class FileSizeError extends Error {}

@Component({
  selector: 'app-import-student-list',
  templateUrl: './import-student-list.component.html',
  styleUrls: ['./import-student-list.component.scss']
})
export class ImportStudentListComponent implements OnInit, OnDestroy {

  // no static: true as it is a part of a template 
  // that may not be in the DOm
  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file') fileRef: ElementRef;

  @ViewChild('upload', {read:TemplateRef, static: true}) uploadTpl: TemplateRef<HTMLElement>
  @ViewChild('spinning', {read:TemplateRef, static: true}) spinningTpl: TemplateRef<HTMLElement>
  @ViewChild('issues', {read:TemplateRef, static: true}) issuesTpl: TemplateRef<HTMLElement>
  tpl: TemplateRef<HTMLElement>;
  tplImplicit: object = {};

  destroy$ = new Subject();
  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<ImportStudentListComponent>,
    private supportService: SupportService,
  ) {}

  buttonStateSubject$: BehaviorSubject<buttonState> = new BehaviorSubject<buttonState>({text: 'Add students', active: false,});
  buttonState$: Observable<buttonState>;

  ngOnInit(): void {
    this.buttonState$ = this.buttonStateSubject$.asObservable();
    // render template to the DOM
    this.tpl = this.uploadTpl;
    this.tplImplicit = {text: 'Upload file', showClose: false};
    // need this to access this.fileRef
    this.attachObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filename: string = '';

  attachObservables() {
    this.buttonStateSubject$.next({text: 'Add students', active: false});
    setTimeout(() => {
        // reset bvalue to upload same file
        fromEvent(this.fileRef.nativeElement, 'click').pipe(tap((evt: Event) => {
          (evt.target as HTMLInputElement).value = '';
        })).subscribe();

        fromEvent(this.fileRef.nativeElement, 'change').pipe(
          tap(() => {
            this.tplImplicit = {hint: 'Examining file'};
            this.tpl = this.spinningTpl;
          }),
          switchMap(_ => {
            const fr = new FileReader();
            const f = this.fileRef.nativeElement.files[0];
            fr.readAsBinaryString(f);
            this.filename = f.name;
            const size = (f.size / 1024 / 1024).toFixed(2); 
            if (+size > 5) {
              throw new FileSizeError('file size is over 5 MB'); 
            };
            return fromEvent(fr, 'load');
          }),
          map((evt: ProgressEvent) => {
            this.tplImplicit = {hint: 'Trying to read students list'};
            // TODO check is right type of file?
            // create a workbook
            const workbook = XLSX.read((evt.target as FileReader).result, {type: 'binary'}); 
            const name = workbook.SheetNames[0];
            const sheet = workbook.Sheets[name];
            const data = XLSX.utils.sheet_to_json(sheet, {header: 1, blankrows: false});
            return data.map(r => r[0]);
          }),
          tap(() => {
            this.tplImplicit = {hint: 'Verifying emails'};
            this.buttonStateSubject$.next({text: `Add students`, active: false});
          }),
          map((mm: string[]) => {
            // retain only strings that looks like an email
            let emailsUnverified =  mm.filter(m => m.indexOf('@') !== -1);
            // unique
            return emailsUnverified.filter((v, i, me) => me.indexOf(v) === i);
          }),
          switchMap((emailsUnverified: string[])=>{
            return this.userService.listOf({email: emailsUnverified}).pipe(
              map((uu: User[]) => [emailsUnverified, uu])
            );
          }),
          tap(([emailsUnverified, usersVerified]) => {
            //this.hint = '';

            const emailsVerified = (usersVerified as User[]).map((u: User) => u.primary_email);
            const emailsFailed = (emailsUnverified as string[]).filter((e: string) => !emailsVerified.includes(e));
            // we have a failure
            if (emailsFailed.length > 0) {
              this.tpl = this.issuesTpl;
              const warning = emailsFailed.length > 1 ? 
                `${emailsFailed.length} emails from total of ${emailsUnverified.length} need atention` :
                `${emailsFailed.length} email from total of ${emailsUnverified.length} need atention` ; 
              this.tplImplicit = {fails: emailsFailed, warning};
              if (emailsVerified.length > 0) {
                this.buttonStateSubject$.next({students: <User[]>usersVerified, text: `Add ${emailsVerified.length} students`, active: true});
              } else {
                this.buttonStateSubject$.next({text: `Add students`, active: false});
              }
            } else { // we are OK
              this.tpl = this.uploadTpl;
              this.attachObservables();

              this.tplImplicit = {text: this.filename, showClose: true};
              this.buttonStateSubject$.next({students: <User[]>usersVerified, text: `Add ${emailsVerified.length} students`, active: true});
              //this.dialogRef.close(usersVerified);
            }
          }),
          takeUntil(this.destroy$),
          catchError(err => {
            this.tpl = this.issuesTpl;
            const warning = 'The file provided is not usable'; 
            this.tplImplicit = {fails: [], warning};
            this.buttonStateSubject$.next({text: `Add students`, active: false});
            if (err instanceof HttpErrorResponse) {
              throw err;
            }
            if (err instanceof FileSizeError) {
              this.tplImplicit['warning'] = 'File size is too big';
            }
            return of(null);
          }),
        ).subscribe();
      }, 0);
  }

  addStudents(ss: User[]) {
    if (ss.length > 0) {
      this.dialogRef.close(ss);
    }
  }

  goUpload() {
    // render
    if (this.tpl === this.uploadTpl) {
      this.dialogRef.close();
      return;
    }

    this.tpl = this.uploadTpl;
    this.tplImplicit = {text: 'Upload file', showClose: false};
    // reattach lost bindings
    this.attachObservables();
  }

  openChat(event) {
    this.supportService.openSupportTrigger$.next();
  }
}

