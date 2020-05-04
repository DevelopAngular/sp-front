import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { fromEvent, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { XlsxService } from '../../../services/xlsx.service';
import { ZipService } from '../../../services/zip.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {

  @ViewChild('csvFile') set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      this.selectedMapFile = fileRef;
      fromEvent(this.selectedMapFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            this.uploadingProgress.csv = true;
            const FR = new FileReader();
            FR.readAsBinaryString(this.selectedMapFile.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          }),
          map(( res: any) => {
            return this.xlsxService.parseXlSXFile(res);
          }),
        )
        .subscribe((users) => {
          debugger;
        });
    }
  }

  @ViewChild('zip') set zipRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      this.selectedImgFile = fileRef;
      fromEvent(fileRef.nativeElement, 'change')
        .pipe(
          switchMap((event) => {
            const FR = new FileReader();
            const file = fileRef.nativeElement.files[0];
            // FR.readAsBinaryString(fileRef.nativeElement.files[0]);
            return of(file);
          }),
          switchMap((file: any) => {
            debugger;
            return this.zipService.getEntries(file);
          }),
          map(result => {
            debugger;
            return result;
          })
        )
        .subscribe((users) => {
        debugger;
      });
    }
  }

  page: number = 1;
  form: FormGroup;
  selectedMapFile;
  selectedImgFile;
  uploadingProgress = {
    images: false,
    csv: false
  };

  constructor(
    private xlsxService: XlsxService,
    private zipService: ZipService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      images: new FormControl(),
      csvFile: new FormControl()
    });
  }

  nextPage() {
    this.page += 1;
  }

}
