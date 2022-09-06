import {Component, ElementRef, OnInit, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Subject} from 'rxjs';
import {tap, map, switchMap, takeUntil} from 'rxjs/operators';
import * as XLSX from 'xlsx';

import {User} from '../../../../models/User';
import {UserService} from '../../../../services/user.service';

interface loadingState {
  done: boolean;
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

  destroy$ = new Subject();
  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<ImportStudentListComponent>,
  ) {}

  // initial: no loading, no hint
  loading: loadingState = {done: true, hint: ''};
  emailsFailed: string[] = [];

  ngOnInit(): void {
    // render template to the DOM
    this.tpl = this.uploadTpl;
    // need this to access this.fileRef
    setTimeout(() => {
      // reset bvalue to upload same file
      fromEvent(this.fileRef.nativeElement, 'click').pipe(tap((evt: Event) => {
        (evt.target as HTMLInputElement).value = '';
      })).subscribe();

      fromEvent(this.fileRef.nativeElement, 'change').pipe(
        tap(() => {
          this.loading.done = false;
          this.loading.hint = 'Examining file';
          this.emailsFailed = [];
          this.tpl = this.spinningTpl;
        }),
        switchMap(_ => {
          const fr = new FileReader();
          fr.readAsBinaryString(this.fileRef.nativeElement.files[0]);
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
          this.loading.done = true;
          //this.loading.hint = '';

          const emailsVerified = (usersVerified as User[]).map((u: User) => u.primary_email);
          this.emailsFailed = (emailsUnverified as string[]).filter((e: string) => !emailsVerified.includes(e));
          if (this.emailsFailed.length > 0) {
            this.tpl = this.issuesTpl;
          } else {
            this.dialogRef.close(usersVerified);
          }
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goUpload() {
    // reset
    this.loading.done = true;
    this.loading.hint = '';
    this.emailsFailed = [];
    // render
    if (this.tpl === this.uploadTpl) {
      this.dialogRef.close();
      return;
    }
    this.tpl = this.uploadTpl;
  }

  get showNextButton(): boolean {
    if (this.tpl === this.uploadTpl) return false;
    if (this.tpl === this.spinningTpl) return false;
    if (this.tpl === this.issuesTpl) return false;
    return true;

  }
}

