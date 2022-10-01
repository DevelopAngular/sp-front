import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { forkJoin, fromEvent, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ConsentMenuComponent } from '../../../consent-menu/consent-menu.component';
import { GradeLevelsUploadGroup } from '../../../models/GradeLevelsUploadGroup';
import { School } from '../../../models/School';
import { User } from '../../../models/User';
import { ToastService } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';
import { XlsxService } from '../../../services/xlsx.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { IDCardService } from '../../../services/IDCardService';
import {result} from 'lodash';

@Component({
  selector: 'app-grade-levels',
  templateUrl: './grade-levels.component.html',
  styleUrls: ['./grade-levels.component.scss']
})
export class GradeLevelsComponent implements OnInit {

  @Input() page: number = 2;

  @Output() backEmit: EventEmitter<any> = new EventEmitter();

  @ViewChild('dots') dots: ElementRef;

  @ViewChild('csvFile') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      fromEvent(fileRef.nativeElement, 'change')
        .pipe(
          filter(() => fileRef.nativeElement.files.length),
          switchMap((evt: Event) => {
            const extension = fileRef.nativeElement.files[0].name.toLowerCase().split('.')[fileRef.nativeElement.files[0].name.split('.').length - 1];
            if (extension === 'csv' || extension === 'xlsx') {
              this.selectedMapFile = fileRef.nativeElement.files[0];
              this.uploadingProgress.csv.inProcess = true;
              const FR = new FileReader();
              FR.readAsBinaryString(fileRef.nativeElement.files[0]);
              return fromEvent(FR, 'load');
            } else {
              return of(null);
            }
          }),
          map(( res: any) => {
            if (!res) {
              return null;
            }
            return this.xlsxService.parseXlSXFile(res);
          }),
          switchMap(rows => {
            if (!rows) {
              return of(null);
            }
            // const regexpEmail = new RegExp('^([A-Za-z0-9_\\-.])+@([A-Za-z0-9_\\-.])+\\.([A-Za-z]{2,4})$');
            const validate$ = rows.map(row => {
              if (typeof row[0] === 'string' && row[0].includes('@spnx.local')) {
                row[0] = row[0].replace('@spnx.local', '');
              }
                return of({ user_id: typeof row[0] === 'string' ? row[0].toLowerCase() : row[0], file_name: row[1], isUserId: !!row[0], isFileName: !!row[1], usedId: false });
            });
            return forkJoin(validate$);
          })
        )
        .subscribe((items) => {
          if (!items) {
            this.toastService.openToast({title: 'Type error', subtitle: 'Sorry, please upload a file ending in .csv', type: 'error'});
            this.uploadingProgress.csv.inProcess = false;
            this.uploadingProgress.csv.complete = false;
            return;
          } else {
            this.selectedMapFile = fileRef.nativeElement.files[0];
            this.selectedMapFiles = items;
            this.uploadingProgress.csv.inProcess = false;
            this.uploadingProgress.csv.complete = true;

          }
        });
    }
  }

  @ViewChild('fgf1') stop: ElementRef;

  form: FormGroup;
  selectedMapFiles: {user_id: string | number, grade_level: number, isUserId: boolean }[] = [];
  selectedImgFiles: {file: File, file_name: string}[];
  selectedMapFile: File;
  filesToDB: any[] = [];
  imagesLength: number;
  uploadingProgress = {
    images: { inProcess: false, complete: false, error: null },
    csv: { inProcess: false, complete: false, error: null }
  };
  picturesLoaderPercent$: Observable<number>;
  showProcessingSpinner$: Observable<boolean>;
  accountsWithoutPictures$: Observable<User[]>;
  accountMissingGradeLevels$: any[] = [];
  // uploadErrors$: Observable<ProfilePicturesError[]>;
  // lastUploadedGroup$: Observable<ProfilePicturesUploadGroup>;
  // uploadedGroups$: Observable<GradeLevelsUploadGroup[]>;
  uploadedGroups$: GradeLevelsUploadGroup[] = [
    {created: new Date(), error_count: 10, event_count: 8, id: 123, last_updated: new Date(), num_assigned_new: 10, num_assigned_update: 2, school_id: 123}
  ]
  user$: Observable<User>;

  school: School;

  issues = [];
  errorUpload: boolean;
  errors = [];

  destroy$: Subject<any> = new Subject<any>();

  uploadedProfiles: any = [];
  allProfiles: any = [];
  newUploadedIDS: number = 0;
  totalUploadedIDS: number = 0;



  constructor(
    public dialogRef: MatDialogRef<GradeLevelsComponent>,
    private xlsxService: XlsxService,
    public dialog: MatDialog,
    private userService: UserService,
    private toastService: ToastService,
    private idCardService: IDCardService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      images: new FormControl(),
      csvFile: new FormControl()
    });

    this.page == 5 ? this.getMissingGradeLevels() : null
  }

  getUploadedGroupTime(date: Date): string {
    return moment(date).format('MMM. DD, YYYY') + ' at ' + moment(date).format('hh:mm A');
  }

  nextPage() {
    this.page += 1;
    if (this.page === 3) {
      const csv_file = this.selectedMapFile;
      this.userService.uploadGradeLevels({csv_file})
        .pipe(
          switchMap((result: any) => {
            this.errors = result.response.errors;
            this.newUploadedIDS = result.response.new_uploads;
            this.totalUploadedIDS = result.response.num_of_uploaded;
            this.page = 4;
            return this.idCardService.updateIDCardField({show_grade_levels: true});
          })
        )
        .subscribe({
          next: () => {
            this.page = 4;
          }
      });
    } else if (this.page === 5) {
      this.userService.clearUploadedData();
      this.getMissingGradeLevels();
    }
  }

  getMissingGradeLevels(){
    this.userService.getMissingGradeLevels().subscribe({
      next: (result: any) => {
        this.accountMissingGradeLevels$ = result
      }
    });
  }

  clearData() {
    this.selectedMapFiles = [];
    this.selectedImgFiles = [];
    this.errors = [];
    this.selectedMapFile = null;
    this.uploadedProfiles = [];
    this.allProfiles = [];
    this.filesToDB = [];
    this.uploadingProgress = {
      images: { inProcess: false, complete: false, error: null },
      csv: { inProcess: false, complete: false, error: null }
    };
    this.form.reset();
  }

  downloadData(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl('data:text/plain;charset=utf-16,' + this.errors.join('\n'));
  }

  generateStudentsCsv(accounts: User[]) {
    const normalizeAccounts = accounts.map(account => {
      return { 'Name': account.display_name, 'Email': account.primary_email  };
    });
    this.xlsxService.generate(normalizeAccounts, 'Missing Grade Levels');
  }

  prepareErrorsToCsv(group) {
    this.userService.getUploadedErrorsRequest(group.id).pipe(
      filter(res => !!res.length),
      take(1),
      tap(errors => {
        const parseErrors = errors.map(error => {
          const errorMessage = error.message.split('=>')[1].trim();
          const userId = error.message.split(':')[1].split('=>')[0].trim();
          return { 'User ID': userId, 'error': errorMessage };
        });
        this.xlsxService.generate(parseErrors, 'Errors');
        this.userService.clearProfilePicturesErrors();
      })
    ).subscribe();
  }

  back() {
    if (this.dialog.getDialogById('student-info')) {
      this.dialogRef.close();
    }
    this.backEmit.emit();
  }

  // findIssues() {
  //   const errors = [];
  //   for (let i = 0; i < this.selectedMapFiles.length; i++) {
  //     if (!this.selectedMapFiles[i].grade_level) {
  //       errors.push({'User ID': this.selectedMapFiles[i].user_id, 'error': 'Image filename not listed'});
  //     } else if (!this.selectedMapFiles[i].user_id) {
  //       errors.push({'Grade Level': this.selectedMapFiles[i].grade_level, 'error': 'User ID not listed'});
  //     } else {
  //       this.filesToDB.push({user_id: this.selectedMapFiles[i].user_id, file: this.selectedImgFiles[this.selectedMapFiles[i].file_name].file});
  //     }
  //   }
  //   return errors;
  // }

  genOption(display, color, action, icon?, hoverBackground?, clickBackground?) {
    return { display, color, action, icon, hoverBackground, clickBackground };
  }

  openConfirm(event) {
    const options = [];
    options.push(this.genOption(
      'Cancel',
      '#E32C66',
      'cancel',
      './assets/Cancel (Red).svg',
      'rgba(227, 44, 102, .1)'
    ));
    const target = new ElementRef(event.currentTarget);
    const cm = this.dialog.open(ConsentMenuComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {header: 'Are you sure you want to cancel uploading Student IDs? Your progess will be lost.', 'options': options, 'trigger': target}
    });

    cm.afterClosed().subscribe(action => {
      if (action === 'cancel') {
        // this.page -= 1;
        this.page = 4;
      }
    });
  }

}
