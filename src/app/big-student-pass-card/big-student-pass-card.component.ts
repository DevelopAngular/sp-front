import {Component, Inject, Input, OnDestroy, OnInit, Optional} from '@angular/core';

import {Subject} from 'rxjs';

import {PassLike} from '../models';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export type PassLayout = 'pass' | 'request' | 'inlinePass' | 'inlineRequest';

@Component({
  selector: 'app-big-student-pass-card',
  templateUrl: './big-student-pass-card.component.html',
  styleUrls: ['./big-student-pass-card.component.scss']
})
export class BigStudentPassCardComponent implements OnInit, OnDestroy {

  @Input() pass: PassLike;
  @Input() formState: any;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() passLayout: PassLayout;
  @Input() forFuture: boolean = false;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    if (this.data['pass']) {
      this.pass = this.data['pass'];
      this.isActive = this.data['isActive'];
      this.forInput = this.data['forInput'];
      this.passLayout = this.data['passLayout'];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
