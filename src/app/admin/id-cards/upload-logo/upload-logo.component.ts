import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fromEvent, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { User } from '../../../models/User';
import { SupportService } from '../../../services/support.service';

@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss']
})
export class UploadLogoComponent  implements OnInit {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('file', { static: true }) set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      fromEvent(fileRef.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            this.uploadingProgress.inProgress = true;
            this.selectedFile = fileRef.nativeElement.files[0];
            const FR = new FileReader();
            FR.readAsDataURL(this.selectedFile);
            return fromEvent(FR, 'load');
          })
        )
        .subscribe((file: any) => {
          this.imageUrl = file.target.result;
          this.complete();
          if (this.dropArea && this.dropArea.nativeElement) {
            this.dropArea.nativeElement.style.backgroundColor = '#E5F7F1';
          }
        });
    }
  }

  isLogoAdded:boolean = false;

  triggerElementRef: HTMLElement;
  imageUrl: string | ArrayBuffer;
  selectedFile;
  form: FormGroup;
  uploadingProgress: {
    inProgress: boolean,
    completed: boolean,
    percent: number
  } = {
    inProgress: false,
    completed: false,
    percent: 0
  };
  dragEvent$: Subject<any> = new Subject<any>();
  dropEvent$: Subject<any> = new Subject<any>();

  destroy$ = new Subject();
  user: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadLogoComponent>,
    private supportService: SupportService,
  ) {
    data?.isLogoAdded ? this.isLogoAdded = data?.isLogoAdded : null
   }

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
          this.selectedFile = dragEvt.dataTransfer.files[0];
          FR.readAsDataURL(this.selectedFile);
          return fromEvent(FR, 'load');
        })
      )
      .subscribe((file: any) => {
        this.imageUrl = file.target.result;
        this.complete();
        if (this.dropArea && this.dropArea.nativeElement) {
          this.dropArea.nativeElement.style.backgroundColor = '#E5F7F1';
        }
      });

    this.dragEvent$.pipe(takeUntil(this.destroy$)).subscribe((dropAreaColor) => {
      if (this.dropArea && this.dropArea.nativeElement) {
        this.dropArea.nativeElement.style.borderColor = dropAreaColor;
      }
    });
  }

  back() {
    this.uploadingProgress = {
      inProgress: false,
      completed: false,
      percent: 0
    };
    this.selectedFile = null;
    this.imageUrl = null;
    this.form.reset();
    if (this.dropArea && this.dropArea.nativeElement) {
      this.dropArea.nativeElement.style.backgroundColor = '#FFFFFF';
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

  showPreview(event: any): void {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageUrl = reader.result;

        reader.readAsDataURL(file);
    }
}

complete() {
  setTimeout(() => {
    this.uploadingProgress.inProgress = false;
    this.uploadingProgress.completed = true;
  }, 1500);
}

openChat(event) {
  this.supportService.openSupportTrigger$.next();
  // this.supportService.openChat(event);
  // this.dialogRef.close()
}

closeChat(event) {
  this.supportService.closeChat(event);
}

}
