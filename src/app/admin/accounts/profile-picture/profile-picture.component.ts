import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {forkJoin, fromEvent, of, zip} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isArray, uniqBy, differenceBy } from 'lodash';

import { XlsxService } from '../../../services/xlsx.service';
import { ZipService } from '../../../services/zip.service';
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
              //   return this.userService.searchProfileById(row[0]).pipe(
              //     map(user => {
              //       debugger;
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
            this.uploadingProgress.images.inProcess = true;
            for (let i = 0; i < fileRef.nativeElement.files.length; i++) {
              const file = fileRef.nativeElement.files.item(i);
              const extension = file.name.toLowerCase().split('.')[file.name.split('.').length - 1];
              if (extension === 'zip' || extension === 'jpeg' || extension === 'png') {
                if (extension === 'zip') {
                  filesStream.push(this.zipService.loadZip(file));
                } else if (extension === 'jpeg' || extension === 'png') {
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
          map(result => {
            let arrayFiles = [];
            result.forEach(item => {
              if (isArray(item)) {
                arrayFiles = [...arrayFiles, ...item];
              } else {
                arrayFiles = [...arrayFiles, item];
              }
            });
            return arrayFiles;
          })
        )
        .subscribe(files => {
          this.selectedImgFiles = uniqBy(files, 'name');
          this.uploadingProgress.images.inProcess = false;
          this.uploadingProgress.images.complete = true;
        });
    }
  }

  page: number = 1;
  form: FormGroup;
  selectedMapFiles: {user_id: string | number, file_name: string, isUserId: boolean, isFileName: boolean }[] = [];
  selectedImgFiles: { file_name: string, file: string }[] = [];
  uploadingProgress = {
    images: { inProcess: false, complete: false, error: null },
    csv: { inProcess: false, complete: false, error: null }
  };
  invalidMapFiles;
  invalidImgFiles;

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

  nextPage() {
    this.page += 1;
    if (this.page === 3) {
      this.findIssues();
    }
  }

  findIssues() {
    this.invalidMapFiles = this.selectedMapFiles.map(file => {
      const errors = [];
      if (!file.isFileName) {
        errors.push({user_id: file.user_id, error: '- Image not listed'});
      }
      if (!file.isUserId) {
        errors.push({image_name: file.file_name, error: '- User ID not listed'});
      }
      if (file.isUserId && file.isFileName && !this.selectedImgFiles.find(img => img.file_name === file.file_name)) {
        errors.push({user_id: file.user_id, image_name: file.file_name, error: '- No image found'});
      }
      return errors;
    });
  }

}
