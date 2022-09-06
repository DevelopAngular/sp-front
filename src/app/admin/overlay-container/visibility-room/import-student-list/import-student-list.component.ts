import {Component, ElementRef, OnInit, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Subject, Observable, BehaviorSubject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';
import * as XLSX from 'xlsx';

import {User} from '../../../../models/User';
import {UserService} from '../../../../services/user.service';
import { SupportService } from '../../../../services/support.service';

interface loadingState {
  hint: string;
}

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

  // initial: no loading, no hint
  loading: loadingState = {hint: ''};

  buttonTextSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('Add students');
  buttonText$: Observable<string>;

  isDisabled: boolean = true;

  ngOnInit(): void {
    this.buttonText$ = this.buttonTextSubject$.asObservable();
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
    setTimeout(() => {
        // reset bvalue to upload same file
        fromEvent(this.fileRef.nativeElement, 'click').pipe(tap((evt: Event) => {
          (evt.target as HTMLInputElement).value = '';
        })).subscribe();

        fromEvent(this.fileRef.nativeElement, 'change').pipe(
          tap(() => {
            this.loading.hint = 'Examining file';
            this.tpl = this.spinningTpl;
          }),
          switchMap(_ => {
            const fr = new FileReader();
            const f = this.fileRef.nativeElement.files[0];
            fr.readAsBinaryString(f);
            this.filename = f.name;
            return fromEvent(fr, 'load');
          }),
          map((evt: ProgressEvent) => {
            this.loading.hint = 'Trying to read students list';
            // TODO check is right type of file?
            // create a workbook
            const workbook = XLSX.read((evt.target as FileReader).result, {type: 'binary'}); 
            const name = workbook.SheetNames[0];
            const sheet = workbook.Sheets[name];
            const data = XLSX.utils.sheet_to_json(sheet, {header: 1, blankrows: false});
            return data.map(r => r[0]);
          }),
          tap(() => this.loading.hint = 'Verifying students'),
          switchMap((emailsUnverified: string[])=>{
            return this.userService.listOf({email: emailsUnverified}).pipe(
              map((uu: User[]) => [emailsUnverified, uu])
            );
          }),
          tap(([emailsUnverified, usersVerified]) => {
            //this.loading.hint = '';

            const emailsVerified = (usersVerified as User[]).map((u: User) => u.primary_email);
            const emailsFailed = (emailsUnverified as string[]).filter((e: string) => !emailsVerified.includes(e));
            this.buttonTextSubject$.next(`Add ${emailsVerified.length} students`);
            if (emailsFailed.length > 0) {
              this.tpl = this.issuesTpl;
              this.tplImplicit = {unverified: emailsUnverified.length, fails: emailsFailed}
            } else {
              this.tpl = this.uploadTpl;
              this.attachObservables();

              this.tplImplicit = {text: this.filename, showClose: true};
              this.buttonTextSubject$.next(`Add ${emailsVerified.length} students`);
              //this.dialogRef.close(usersVerified);
            }
          }),
          takeUntil(this.destroy$)
        ).subscribe();
      }, 0);
  }

  goUpload() {
    // reset
    this.loading.hint = '';
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

