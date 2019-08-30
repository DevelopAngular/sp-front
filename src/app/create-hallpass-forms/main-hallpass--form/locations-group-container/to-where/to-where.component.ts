import {Component, EventEmitter, HostListener, Input, OnInit, Output, Inject, ViewChild, ElementRef} from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import { CreateFormService } from '../../../create-form.service';
import { States } from '../locations-group-container.component';
import {ScreenService} from '../../../../services/screen.service';
import {ToWhereGridRestriction} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestriction';
import {ToWhereGridRestrictionLg} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionLg';
import {ToWhereGridRestrictionSm} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionSm';
import {ToWhereGridRestrictionMd} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionMd';
import {MAT_DIALOG_DATA} from '@angular/material';
import {fromEvent} from 'rxjs';
import {DeviceDetection} from '../../../../device-detection.helper';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('rc') set rc(rc: ElementRef<HTMLDivElement> ) {
    if (rc) {
      fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
        let blur: number;

        if ((evt.target as HTMLDivElement).scrollTop < 100) {
          blur = 5;
        } else if ((evt.target as HTMLDivElement).scrollTop > 100 && (evt.target as HTMLDivElement).scrollTop < 400) {
          blur = (evt.target as HTMLDivElement).scrollTop / 20;
        } else {
          blur = 20;
        }

        this.header.nativeElement.style.boxShadow = `0 1px ${blur}px 0px rgba(0,0,0,.2)`;
      });
    }
  }
  @Input() location;
  @Input() formState: Navigation;
  @Input() pinnables: Promise<Pinnable[]>;
  @Input() isStaff: boolean;
  @Input() date;
  @Input() studentText;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  public states;

  public teacherRooms: Pinnable[] = [];

  public gridRestrictions: ToWhereGridRestriction = new ToWhereGridRestrictionLg();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formService: CreateFormService,
    public screenService: ScreenService

  ) {
    this.states = States;
  }

  ngOnInit() {
    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
    this.teacherRooms = this.formState.data.teacherRooms;
    this.gridRestrictions = this.getViewRestriction();
    if (!this.dialogData['kioskMode']) {
        this.teacherRooms = this.formState.data.teacherRooms;
    }
      console.log('STAte ==>>>', this.formState);
  }

  pinnableSelected(pinnable) {
    this.formService.setFrameMotionDirection('forward');
    setTimeout(() => {
      this.selectedPinnable.emit(pinnable);
    }, 100);
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      if (!!this.date &&
        !!this.studentText &&
        (this.formState.previousStep === 2 || this.formState.previousStep === 4)
      ) {
        this.formState.previousState = this.formState.state;
        this.formState.step = 1;
        this.formState.previousStep = 3;
      } else {
        this.formState.previousState = this.formState.state;
        if (this.formState.formMode.formFactor === 3 && this.formState.data.date.declinable) {
            this.formState.step = 1;
        } else {
          if (this.formState.kioskMode) {
            this.formState.step = 2;
            this.formState.state = 4;
          } else {
              this.formState.state -= 1;
          }
        }
      }
      this.formState.previousState = this.formState.state;

      //
      this.backButton.emit(this.formState);
    }, 100);
  }

  @HostListener('window: resize')
  changeGridView() {
    this.gridRestrictions = this.getViewRestriction();
  }

  private getViewRestriction(): ToWhereGridRestriction {
    if (this.screenService.isDeviceMid && !this.screenService.isDeviceSmallExtra
      || this.screenService.isDeviceLargeExtra && !this.screenService.isDeviceSmallExtra ) {
      return new ToWhereGridRestrictionMd();
    }

    if (this.screenService.isDeviceSmallExtra) {
      return  new ToWhereGridRestrictionSm();
    }

    return new ToWhereGridRestrictionLg();
  }

  get displayFooters() {
    return this.screenService.isDeviceLargeExtra;
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
