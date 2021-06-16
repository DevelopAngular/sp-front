import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {forkJoin, fromEvent, of, Subject, zip} from 'rxjs';
import {catchError, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {isArray, uniqBy} from 'lodash';

import {XlsxService} from '../../../services/xlsx.service';
import {ZipService} from '../../../services/zip.service';
import {UserService} from '../../../services/user.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConsentMenuComponent} from '../../../consent-menu/consent-menu.component';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit, OnDestroy {

  @Output() backEmit: EventEmitter<any> = new EventEmitter();

  @ViewChild('csvFile') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      fromEvent(fileRef.nativeElement , 'change')
        .pipe(
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
                  filesStream.push(fromEvent(reader, 'load').pipe(map((item: any) => {
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

  page: number = 2;
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
  issues = [];
  errorUpload: boolean;
  errors;

  destroy$: Subject<any> = new Subject<any>();

  fakeUsers = [
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'},
    {name: 'Peter Luba', number: 232323, file: '2342.jpeg'}
  ];

  constructor(
    public dialogRef: MatDialogRef<ProfilePictureComponent>,
    private xlsxService: XlsxService,
    private zipService: ZipService,
    private dialog: MatDialog,
    private userService: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      images: new FormControl(),
      csvFile: new FormControl()
    });

    this.userService.profilePicturesLoaded$
      .pipe(
        filter(loaded => this.page === 3 && loaded),
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.userService.isLoadedAccounts$.student.pipe(
            switchMap(loaded => {
              if (loaded) {
                return this.userService.accounts.studentAccounts;
              } else {
                this.userService.getUsersList('')
              }
            })
          );
        })
      )
      .subscribe(() => {
        this.page = 4;
      });
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

  nextPage() {
    this.page += 1;
    if (this.page === 3) {
      console.log(this.selectedMapFiles);
      console.log(this.selectedImgFiles);
      this.errors = this.findIssues();
      this.userService.postProfilePicturesRequest(
        this.filesToDB.map(f => f.user_id),
        this.filesToDB.map(f => f.file)
      );
    } else if (this.page === 4) {

    }
  }

  back() {
    this.backEmit.emit();
  }

  findIssues() {
    const errors = [];
    this.selectedMapFiles.forEach(file => {
      if (!file.file_name) {
        errors.push({fileNotListed: file});
      } else if (!file.user_id) {
        errors.push({noUserIdListed: file});
      } else if (file.file_name && !this.selectedImgFiles[file.file_name]) {
        errors.push({noImgFound: file});
      } else {
        this.filesToDB.push({user_id: file.user_id, file: this.selectedImgFiles[file.file_name].file});
      }
    });
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
}
