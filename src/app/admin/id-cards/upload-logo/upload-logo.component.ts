import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss']
})
export class UploadLogoComponent implements OnInit {

  // @ViewChild('file', { static: true }) set fileRef(fileRef: ElementRef) {
  //   if (fileRef && fileRef.nativeElement) {
  //     fromEvent(fileRef.nativeElement , 'change')
  //       .pipe(
  //         switchMap((evt: Event) => {
  //           console.log("Here")
  //           this.selectedFile = fileRef.nativeElement.files[0];
  //           const FR = new FileReader();
  //           FR.readAsDataURL(this.selectedFile);
  //           return fromEvent(FR, 'load');
  //         })
  //       )
  //       .subscribe((file: any) => {
  //         console.log("Here")
  //         this.imageUrl = file.target.result;
  //       });
  //   }
  // }

  selectedFile;
  imageUrl;

  constructor(
    private dialogRef: MatDialogRef<UploadLogoComponent>,
  ) { }

  ngOnInit(): void {
  }

  showPreview(event: any): void {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageUrl = reader.result;

        reader.readAsDataURL(file);
    }
}

}
