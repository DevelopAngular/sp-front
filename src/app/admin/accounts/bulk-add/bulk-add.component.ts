import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

import {map, switchMap, takeUntil} from 'rxjs/operators';
import {forkJoin, fromEvent, MonoTypeOperatorFunction, of, Subject, zip} from 'rxjs';
import {differenceBy} from 'lodash';
import * as XLSX from 'xlsx';

import {UserService} from '../../../services/user.service';
import {HttpService} from '../../../services/http-service';

export interface ImportAccount {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  primary_email: string;
  password?: string;
  existsEmail?: boolean;
  invalidEmail?: boolean;
  invalidType?: boolean;
}

export function validationAccounts<T>(userService): MonoTypeOperatorFunction<ImportAccount[]> {
  return users$ => users$.pipe(
    switchMap((users: any) => {
      return forkJoin({
        users: of(users),
        isValidEmail: zip(...users.map(user => {
          if (user.primary_email) {
            return userService.checkUserEmail(user.primary_email);
          } else {
            return of({exists: false});
          }
        }))
      });
    }),
    map(({users, isValidEmail}: {users: ImportAccount[], isValidEmail: {exists: boolean}[]}) => {
      return users.map((user, index) => {
        return {
          ...user,
          existsEmail: isValidEmail[index].exists,
          invalidEmail: !user.primary_email,
          invalidType: !user.type ||
            (user.type.toLowerCase() !== '_profile_admin' &&
            user.type.toLowerCase() !== '_profile_teacher' &&
            user.type.toLowerCase() !== '_profile_student')
        };
      });
    })
  );
}

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss']
})
export class BulkAddComponent implements OnInit, OnDestroy {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      this.selectedFile = fileRef;
      fromEvent(this.selectedFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            this.uploadingProgress.inProgress = true;
            const FR = new FileReader();
            FR.readAsBinaryString(this.selectedFile.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          }),
          map(( res: any) => {
            return this.parseFile(res);
          }),
          validationAccounts(this.userService),
        )
        .subscribe((users) => {
          this.complete(users);
        });
    }
  }

  form: FormGroup;
  saveAccountPage: boolean;

  uploadingProgress: {
    inProgress: boolean,
    completed: boolean,
    percent: number
  } = {
    inProgress: false,
    completed: false,
    percent: 0
  };

  importAccounts: ImportAccount[] = [];
  invalidAccounts: ImportAccount[] = [];
  validAccountsToDb: ImportAccount[] = [];

  selectedFile: ElementRef;

  dragEvent$: Subject<any> = new Subject<any>();
  dropEvent$: Subject<any> = new Subject<any>();

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<BulkAddComponent>,
    private http: HttpService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl()
    });

    this.dropEvent$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((dragEvt: DragEvent) => {
          this.uploadingProgress.inProgress = true;
          const FR = new FileReader();
          FR.readAsBinaryString(dragEvt.dataTransfer.files[0]);
          return fromEvent(FR, 'load');
        }),
        map(( res: any) => {
          return this.parseFile(res);
        }),
        validationAccounts(this.userService)
      )
      .subscribe((users) => {
        this.complete(users);
      });

    this.dragEvent$.pipe(takeUntil(this.destroy$)).subscribe((dropAreaColor) => {
      if (this.dropArea && this.dropArea.nativeElement && this.getAccountsImportScreen() === 1) {
        this.dropArea.nativeElement.style.borderColor = dropAreaColor;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  complete(users) {
    setTimeout(() => {
      this.uploadingProgress.inProgress = false;
      this.uploadingProgress.completed = true;
    }, 1500);
    this.invalidAccounts = users.filter(user => user.existsEmail || user.invalidEmail || user.invalidType);
    this.importAccounts = users;
    this.validAccountsToDb = differenceBy(this.importAccounts, this.invalidAccounts, 'id');
  }

  goBack() {
    this.importAccounts = [];
    this.invalidAccounts = [];
    this.form.reset();
    this.saveAccountPage = false;
    this.uploadingProgress = {
      inProgress: false,
      completed: false,
      percent: 0
    };
  }

  parseFile(res): ImportAccount[] {
    const raw = XLSX.read(res.target.result, {type: 'binary'});
    const sn = raw.SheetNames[0];
    const stringCollection = raw.Sheets[sn];
    const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
    const rows = data.slice(1);
    return rows.map((row, index) => {
      return {
        id: `Fake ${Math.floor(Math.random() * (1 - 1000)) + 1000}`,
        type: row[0] ? ('_profile_' + row[0]).toLowerCase().trim() : null,
        first_name: row[1] ? ('' + row[1]).trim() : null,
        last_name: row[2] ? ('' + row[2]).trim() : null,
        primary_email: row[3] ? ('' + row[3]).trim() : null,
        password: row[4] ? ('' + row[4]).trim() : null
      };
    });
  }

  getProgress(progress: HTMLElement) {
    const timerId = setInterval(() => {
      if (this.uploadingProgress.percent < 100) {
        progress.style.backgroundImage = `linear-gradient(to right, #ECF1FF ${this.uploadingProgress.percent}%, transparent 0)`;
        this.uploadingProgress.percent += 1;
      } else {
        progress.style.backgroundImage = `linear-gradient(to right, #ECF1FF 100%, transparent 0)`;
        clearInterval(timerId);
      }
    }, 500);
  }

  getAccountsImportScreen() {
    if (!this.importAccounts.length || !this.uploadingProgress.completed) {
      return 1;
    } else if (this.importAccounts.length && this.invalidAccounts.length && this.uploadingProgress.completed) {
      if (this.saveAccountPage) {
        return 3;
      } else {
        return 2;
      }
    } else if (this.importAccounts.length && !this.invalidAccounts.length) {
      this.saveAccountPage = true;
      return 3;
    }
  }

  handleDragEvent( evt: DragEvent, dropAreaColor: string) {
    evt.preventDefault();
    this.dragEvent$.next(dropAreaColor);
  }

  catchFile(evt: DragEvent) {
    evt.preventDefault();
    this.dropEvent$.next(evt);
  }

  save() {
    const accounts = this.validAccountsToDb.map(user => {
      const emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      const userData: any = {
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.primary_email,
        username: `${user.first_name} ${user.last_name}`,
        profiles: [user.type]
      };
      return userData;
      // const userType = emailExp.test(user.primary_email) ? 'email' : 'username';
      // return this.userService.addAccountRequest(this.http.getSchool().id, userData, userType, [user.type.toLowerCase()], `_profile_${user.type.toLowerCase()}`);
    });
    debugger;
    // zip(...requests$).subscribe(res => {
    //   console.log(res);
    // });
  }

}
