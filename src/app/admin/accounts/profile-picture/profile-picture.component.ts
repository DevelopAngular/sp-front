import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {combineLatest, forkJoin, fromEvent, Observable, of, Subject, zip} from 'rxjs';
import {catchError, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {cloneDeep, isArray, uniqBy} from 'lodash';

import {XlsxService} from '../../../services/xlsx.service';
import {ZipService} from '../../../services/zip.service';
import {UserService} from '../../../services/user.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConsentMenuComponent} from '../../../consent-menu/consent-menu.component';
import {ToastService} from '../../../services/toast.service';
import {User} from '../../../models/User';
import {ProfilePicturesError} from '../../../models/ProfilePicturesError';
import {ProfilePicturesUploadGroup} from '../../../models/ProfilePicturesUploadGroup';
import * as moment from 'moment';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit, OnDestroy {

  @Input() page: number = 2;

  @Output() backEmit: EventEmitter<any> = new EventEmitter();

  @ViewChild('csvFile') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      fromEvent(fileRef.nativeElement, 'change')
        .pipe(
          filter(() => fileRef.nativeElement.files.length),
          switchMap((evt: Event) => {
            this.selectedMapFile = fileRef.nativeElement.files[0];
            this.uploadingProgress.csv.inProcess = true;
            const FR = new FileReader();
            FR.readAsBinaryString(fileRef.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          }),
          map(( res: any) => {
            return this.xlsxService.parseXlSXFile(res);
          }),
          switchMap(rows => {
            const validate$ = rows.map(row => {
                return of({ user_id: row[0], file_name: row[1], isUserId: !!row[0], isFileName: !!row[1], usedId: false });
            });
            return forkJoin(validate$);
          }),
          catchError(error => {
            this.errorUpload = true;
            this.toastService.openToast({title: 'Type error', subtitle: error.message, type: 'error'});
            return of(null);
          })
        )
        .subscribe((items) => {
          if (!this.errorUpload) {
            this.selectedMapFile = fileRef.nativeElement.files[0];
            this.selectedMapFiles = items;
          }
          this.uploadingProgress.csv.inProcess = false;
          this.uploadingProgress.csv.complete = true;
        });
    }
  }

  @ViewChild('zip') set zipRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      fromEvent(fileRef.nativeElement, 'change')
        .pipe(
          filter(() => fileRef.nativeElement.files.length),
          switchMap((event) => {
            const filesStream = [];
            if (fileRef.nativeElement.files.length === 1) {
              const extension = fileRef.nativeElement.files[0].name.toLowerCase().split('.')[fileRef.nativeElement.files[0].name.split('.').length - 1];
              if (extension !== 'zip' && extension !== 'jpeg' && extension !== 'jpg' && extension !== 'png') {
                return of(null);
              }
            }
            this.uploadingProgress.images.inProcess = true;
            for (let i = 0; i < fileRef.nativeElement.files.length; i++) {
              const file = fileRef.nativeElement.files.item(i);
              const extension = file.name.toLowerCase().split('.')[file.name.split('.').length - 1];
              if (extension === 'zip' || extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
                if (extension === 'zip') {
                  filesStream.push(this.zipService.loadZip(file));
                } else if (extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  filesStream.push(fromEvent(reader, 'load').pipe(
                    map((item: any) => {
                    return { file_name: file.name, file: file };
                  })));
                }
              }
            }
            return zip(...filesStream);
          }),
          filter(res => !!res),
          map(result => {
            let arrayFiles = [];
            result.forEach(item => {
              if (isArray(item)) {
                arrayFiles = [...arrayFiles, ...item];
              } else {
                arrayFiles = [...arrayFiles, item];
              }
            });
            return uniqBy(arrayFiles, 'file_name');
          })
        )
        .subscribe((files: {file: File, file_name: string}[]) => {
          this.imagesLength = files.length;
          this.selectedImgFiles = this.parseArrayToObject(files);
          this.uploadingProgress.images.inProcess = false;
          this.uploadingProgress.images.complete = true;
        });
    }
  }

  @ViewChild('fgf1') stop: ElementRef;

  form: FormGroup;
  selectedMapFiles: {user_id: string | number, file_name: string, isUserId: boolean, isFileName: boolean }[] = [];
  selectedImgFiles: {file: File, file_name: string}[];
  selectedMapFile: File;
  filesToDB: any[] = [];
  imagesLength: number;
  uploadingProgress = {
    images: { inProcess: false, complete: false, error: null },
    csv: { inProcess: false, complete: false, error: null }
  };
  picturesLoaderPercent$: Observable<number>;
  accountsWithoutPictures$: Observable<User[]>;
  uploadErrors$: Observable<ProfilePicturesError[]>;
  lastUploadedGroup$: Observable<ProfilePicturesUploadGroup>;
  uploadedGroups$: Observable<ProfilePicturesUploadGroup[]>;

  issues = [];
  errorUpload: boolean;
  errors = [];

  destroy$: Subject<any> = new Subject<any>();

  uploadedProfiles: any = [];
  allProfiles: any = [];

  constructor(
    public dialogRef: MatDialogRef<ProfilePictureComponent>,
    private xlsxService: XlsxService,
    private zipService: ZipService,
    private dialog: MatDialog,
    private userService: UserService,
    private toastService: ToastService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      images: new FormControl(),
      csvFile: new FormControl()
    });
    this.picturesLoaderPercent$ = this.userService.profilePictureLoaderPercent$;
    this.accountsWithoutPictures$ = this.userService.missingProfilePictures$;
    this.uploadErrors$ = this.userService.profilePicturesUploadErrors$;
    this.lastUploadedGroup$ = this.userService.lastUploadedGroup$;
    this.uploadedGroups$ = this.userService.uploadedGroups$;

    this.picturesLoaderPercent$.pipe(
      filter((v) => !!v && !!this.stop),
      takeUntil(this.destroy$),
    ).subscribe(res => {
      this.renderer.setAttribute(this.stop.nativeElement, 'offset', `${res}%`);
    });

    // this.uploadHistory$ = combineLatest(
    //   this.uploadErrors$.pipe(filter(res => !!res.length)),
    //   this.uploadedGroups$.pipe(filter(res => !!res.length))
    // ).pipe(
    //   map(([errors, groups]) => {
    //     const history_date = this.getUploadedGroupTime(groups[groups.length - 1].created);
    //     const groups_info = groups.reduce((acc, group) => {
    //       return { new: acc.new + group.num_assigned_new, updated: acc.updated + group.num_assigned_update };
    //     }, {new: 0, updated: 0});
    //     return { history_date, groups_info };
    //   })
    // );

    this.userService.profilePicturesLoaded$
      .pipe(
        filter(loaded => this.page === 3 && loaded),
        takeUntil(this.destroy$),
        switchMap(() => {
          const files = this.filesToDB.reduce((acc, curr) => {
            return { ...acc, [curr.user_id]: curr };
          }, {});
          return zip(
            this.userService.profiles$,
            of(files)
          );
        }),
        map(([students, files]) => {
          return students.map(student => {
            const user = {
              ...student,
              file_name: student.extras.clever_student_number ? files[student.extras.clever_student_number].file.name : files[student.primary_email].file.name,
              student_number: student.extras.clever_student_number
            };
            return user;
          });
        })
      )
      .subscribe((students) => {
        this.uploadedProfiles = students;
        this.allProfiles = cloneDeep(this.uploadedProfiles);
        this.page = 4;
      });

    this.userService.profilePicturesErrors$.pipe(takeUntil(this.destroy$)).subscribe(er => {
      this.errors.push(er);
    });

    if (this.page === 5) {
      this.userService.getMissingProfilePicturesRequest();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  parseArrayToObject(array: any[]) {
    return array.reduce((acc, curr) => {
      return { ...acc, [curr.file_name]: curr };
    }, {});
  }

  getUploadedGroupTime(date: Date): string {
    return moment(date).format('MMM. DD, YYYY') + ' at ' + moment(date).format('hh:mm A');
  }

  nextPage() {
    this.page += 1;
    if (this.page === 3) {
      this.errors = this.findIssues();
      const userIds = this.filesToDB.map(f => f.user_id);
      const files = this.filesToDB.map(f => f.file);
      if (userIds.length && files.length) {
        this.userService.postProfilePicturesRequest(
          userIds,
          files
        ).pipe(
          filter(profiles => !!profiles.length)
        ).subscribe(r => {
          this.userService.putProfilePicturesErrorsRequest(this.errors);
        });
      } else {
        this.toastService.openToast({title: 'Error', subtitle: 'Please check if the data is correct', type: 'error'});
        this.page -= 1;
        this.clearData();
      }
    } else if (this.page === 5) {
      this.userService.getMissingProfilePicturesRequest();
      this.userService.getUploadedGroupsRequest();
    }
  }

  clearData() {
    this.selectedMapFiles = [];
    this.selectedImgFiles = [];
    this.errors = [];
    this.selectedMapFile = null;
    this.uploadingProgress = {
      images: { inProcess: false, complete: false, error: null },
      csv: { inProcess: false, complete: false, error: null }
    };
    this.form.reset();
  }

  generateErrorsCsv() {
    this.xlsxService.generate(this.errors, 'Errors');
  }

  generateStudentsCsv(accounts: User[]) {
    const normalizeAccounts = accounts.map(account => {
      return { 'Name': account.display_name, 'Email': account.primary_email  };
    });
    this.xlsxService.generate(normalizeAccounts, 'Missing Pictures');
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
    this.backEmit.emit();
  }

  findIssues() {
    const errors = [];
    for (let i = 0; i < this.selectedMapFiles.length; i++) {
      if (!this.selectedMapFiles[i].file_name) {
        errors.push({'User ID': this.selectedMapFiles[i].user_id, 'error': 'Image filename not listed'});
      } else if (!this.selectedMapFiles[i].user_id) {
        errors.push({'Image filename': this.selectedMapFiles[i].file_name, 'error': 'User ID not listed'});
      } else if (this.selectedMapFiles[i].file_name && !this.selectedImgFiles[this.selectedMapFiles[i].file_name]) {
        errors.push({'User ID': this.selectedMapFiles[i].user_id, 'error': 'No image found'});
      } else {
        this.filesToDB.push({user_id: this.selectedMapFiles[i].user_id, file: this.selectedImgFiles[this.selectedMapFiles[i].file_name].file});
      }
    }
    return errors;
  }

  redirect(location) {
    window.open(location, '_blank');
  }

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
      data: {header: 'Are you sure you want to cancel bulk uploading profile pictures? Your progress will be lost.', 'options': options, 'trigger': target}
    });

    cm.afterClosed().subscribe(action => {
      if (action === 'cancel') {
        this.page -= 1;
      }
    });
  }

  searchUsers(search) {
    this.uploadedProfiles = this.allProfiles.filter(profile => {
      return profile.display_name.toLowerCase().includes(search.toLowerCase());
    });
  }
}
