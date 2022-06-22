import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild
} from '@angular/core';

import {Subject} from 'rxjs';

import {PassLike} from '../models';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DeviceDetection} from '../device-detection.helper';
import {StorageService} from '../services/storage.service';
import {PassLimitInfo} from '../models/HallPassLimits';

export type PassLayout = 'pass' | 'request' | 'inlinePass' | 'inlineRequest';

@Component({
  selector: 'app-big-student-pass-card',
  templateUrl: './big-student-pass-card.component.html',
  styleUrls: ['./big-student-pass-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BigStudentPassCardComponent implements OnInit, OnDestroy {

  @Input() pass: PassLike;
  @Input() formState: any;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() passLayout: PassLayout;
  @Input() forFuture: boolean = false;
  @Input() passLimitInfo: PassLimitInfo;
  @Output() closeCard: EventEmitter<any> = new EventEmitter<any>();

  // using ViewChild as a setter ensures the element is available for assigning values
  @ViewChild('wrapper')
  set wrapper(divRef: ElementRef<HTMLDivElement>) {
    const wrapperDiv = divRef.nativeElement;
    if (this.isMobile) {
      wrapperDiv.style.transform = 'scale(1.15) translateY(-65px)';
      return;
    }
    // we want the pass limit and bottom banners to be 90% of the
    // screen height
    const {height} = wrapperDiv.getBoundingClientRect();
    const targetHeight = document.documentElement.clientHeight * 0.85;
    const scalingFactor = targetHeight / height;
    // translate happens before the scaling
    wrapperDiv.style.transform = ` translateY(-60px) scale(${scalingFactor})`;
  }

  isMobile: boolean;
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private storage: StorageService
  ) {
  }

  ngOnInit(): void {
    this.isMobile = DeviceDetection.isMobile();
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

  close() {
    this.storage.setItem('pass_full_screen', false);
    this.closeCard.emit();
  }
}
