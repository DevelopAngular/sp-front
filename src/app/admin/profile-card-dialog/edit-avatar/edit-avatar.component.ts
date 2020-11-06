import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';
import {fromEvent, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-edit-avatar',
  templateUrl: './edit-avatar.component.html',
  styleUrls: ['./edit-avatar.component.scss']
})
export class EditAvatarComponent implements OnInit, OnDestroy {

  @ViewChild('dropArea', { static: false }) dropArea: ElementRef;
  @ViewChild('file', { static: true }) set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      this.selectedFile = fileRef;
      fromEvent(this.selectedFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            this.uploadingProgress.inProgress = true;
            const FR = new FileReader();
            FR.readAsDataURL(this.selectedFile.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          })
        )
        .subscribe((file: any) => {
          this.imageUrl = file.target.result;
          this.complete();
        });
    }
  }

  triggerElementRef: HTMLElement;
  selectedFile;
  imageUrl: string;

  uploadingProgress: {
    inProgress: boolean,
    completed: boolean,
    percent: number
  } = {
    inProgress: false,
    completed: false,
    percent: 0
  };
  form: FormGroup;

  dragEvent$: Subject<any> = new Subject<any>();
  dropEvent$: Subject<any> = new Subject<any>();

  destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<EditAvatarComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.updatePosition();

    this.form = new FormGroup({
      file: new FormControl()
    });

    this.dropEvent$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((dragEvt: DragEvent) => {
          this.uploadingProgress.inProgress = true;
          const FR = new FileReader();
          FR.readAsDataURL(dragEvt.dataTransfer.files[0]);
          return fromEvent(FR, 'load');
        })
      )
      .subscribe((file: any) => {
        this.imageUrl = file.target.result;
        this.complete();
      });

    this.dragEvent$.pipe(takeUntil(this.destroy$)).subscribe((dropAreaColor) => {
      if (this.dropArea && this.dropArea.nativeElement) {
        this.dropArea.nativeElement.style.borderColor = dropAreaColor;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDragEvent( evt: DragEvent, dropAreaColor: string) {
    evt.preventDefault();
    this.dragEvent$.next(dropAreaColor);
  }

  catchFile(evt: DragEvent) {
    evt.preventDefault();
    this.dropEvent$.next(evt);
  }

  complete() {
    setTimeout(() => {
      this.uploadingProgress.inProgress = false;
      this.uploadingProgress.completed = true;
    }, 1500);
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
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left - 200}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
