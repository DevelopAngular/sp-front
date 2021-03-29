import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import {Subject} from 'rxjs';

import {PassLike} from '../models';
import {MatDialogRef} from '@angular/material/dialog';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';

@Component({
  selector: 'app-big-student-pass-card',
  templateUrl: './big-student-pass-card.component.html',
  styleUrls: ['./big-student-pass-card.component.scss']
})
export class BigStudentPassCardComponent implements OnInit, OnDestroy {

  @Input() pass: PassLike;
  @Input() formState: any;

  destroy$: Subject<any> = new Subject<any>();

  constructor(private dialogRef: MatDialogRef<CreateHallpassFormsComponent>) { }

  ngOnInit(): void {
    // this.dialogRef.updatePosition({top: '20%'});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
