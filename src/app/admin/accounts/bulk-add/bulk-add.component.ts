import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {map, switchMap} from 'rxjs/operators';
import {forkJoin, fromEvent, MonoTypeOperatorFunction, of, Subject, zip} from 'rxjs';
import * as XLSX from 'xlsx';
import {UserService} from '../../../services/user.service';
import { differenceBy } from 'lodash';

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
          return userService.checkUserEmail(user.primary_email);
        }))
      });
    }),
    map(({users, isValidEmail}: {users: ImportAccount[], isValidEmail: {exists: boolean}[]}) => {
      return users.map((user, index) => {
        return {
          ...user,
          existsEmail: isValidEmail[index].exists,
          invalidEmail: !user.primary_email,
          invalidType: !user.type
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
export class BulkAddComponent implements OnInit {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      console.log(this.selectedFile);
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

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl()
    });

    this.dropEvent$
      .pipe(
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

    this.dragEvent$.subscribe((dropAreaColor) => {
      if (this.dropArea && this.dropArea.nativeElement && this.getAccountsImportScreen() === 1) {
        this.dropArea.nativeElement.style.borderColor = dropAreaColor;
      }
    });
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
        type: row[0] ? ('' + row[0]).trim() : null,
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

}
