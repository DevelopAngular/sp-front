import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {forkJoin, fromEvent, of, zip} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {isArray, uniqBy} from 'lodash';

import {XlsxService} from '../../../services/xlsx.service';
import {ZipService} from '../../../services/zip.service';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {

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
              // if (!!row[0]) {
              //   return this.userService.searchProfileWithFilter(row[0]).pipe(
              //     map(user => {
              //       return { user_id: row[0], file_name: row[1], isUserId: !!row[0], isFileName: !!row[1], usedId: !user };
              //     })
              //   );
              // } else {
                return of({ user_id: row[0], file_name: row[1], isUserId: !!row[0], isFileName: !!row[1], usedId: false });
              // }
            });
            return forkJoin(validate$);
          })
        )
        .subscribe((items) => {
          this.selectedMapFiles = items;
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
                    return { file_name: file.name, file: item.target.result };
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
          }),
          map(files => {
            return this.parseArrayToObject(files);
          })
        )
        .subscribe(files => {
          this.imagesLength = Object.keys(files).length;
          this.selectedImgFiles = files;
          this.uploadingProgress.images.inProcess = false;
          this.uploadingProgress.images.complete = true;
        });
    }
  }

  page: number = 2;
  form: FormGroup;
  selectedMapFiles: {user_id: string | number, file_name: string, isUserId: boolean, isFileName: boolean }[] = [];
  selectedImgFiles;
  selectedMapFile: File;
  filesToDB: any[] = [];
  imagesLength: number;
  uploadingProgress = {
    images: { inProcess: false, complete: false, error: null },
    csv: { inProcess: false, complete: false, error: null }
  };
  issues = [];

  constructor(
    private xlsxService: XlsxService,
    private zipService: ZipService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      images: new FormControl(),
      csvFile: new FormControl()
    });
  }

  parseArrayToObject(array: any[]) {
    return array.reduce((acc, curr) => {
      return { ...acc, [curr.file_name]: curr };
    }, {});
  }

  nextPage() {
    this.page += 1;
    if (this.page === 3) {
      this.issues = this.findIssues();
    } else if (this.page === 4) {

    }
  }

  findIssues() {
    const errors = [];
    this.selectedMapFiles.forEach(file => {
      if (!file.file_name) {
        errors.push({fileNotListed: file});
      } else if (!file.user_id)  {
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
}
