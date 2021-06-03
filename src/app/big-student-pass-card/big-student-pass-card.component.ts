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

  @Output() closeCard: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('wrapper') wrapper: ElementRef;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private storage: StorageService
  ) { }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

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

  close() {
    this.storage.setItem('pass_full_screen', false);
    this.closeCard.emit();
  }

  scalePage(element: HTMLElement) {
    const pageWidth = document.documentElement.clientWidth;
    const pageHeight = document.documentElement.clientHeight / 100 * 90;
    const popupWidth = element.clientWidth;
    const popupHeight = element.clientHeight;
    return Math.min(pageWidth / popupWidth, pageHeight / popupHeight, 1.6);
  }

}
