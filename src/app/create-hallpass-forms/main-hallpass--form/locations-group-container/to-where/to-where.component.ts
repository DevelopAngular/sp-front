import {Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Pinnable} from '../../../../models/Pinnable';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {States} from '../locations-group-container.component';
import {ScreenService} from '../../../../services/screen.service';
import {ToWhereGridRestriction} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestriction';
import {ToWhereGridRestrictionLg} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionLg';
import {ToWhereGridRestrictionSm} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionSm';
import {ToWhereGridRestrictionMd} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionMd';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {BehaviorSubject, fromEvent, Observable} from 'rxjs';
import {DeviceDetection} from '../../../../device-detection.helper';
import {StorageService} from '../../../../services/storage.service';
import {TooltipDataService} from '../../../../services/tooltip-data.service';
import {PassLimit} from '../../../../models/PassLimit';
import {LocationsService} from '../../../../services/locations.service';
import {ToWherePassLimitDialog} from './to-where-pass-limit-dialog.component';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {
  @ViewChild('header', { static: true }) header: ElementRef<HTMLDivElement>;
  @ViewChild('rc', { static: true }) set rc(rc: ElementRef<HTMLDivElement> ) {
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
  @Input() pinnables: Observable<Pinnable[]>;
  @Input() isStaff: boolean;
  @Input() date;
  @Input() studentText;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  public states;

  public teacherRooms: Pinnable[] = [];
  public isLocationList$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(JSON.parse(this.storage.getItem('isGrid')));
  public hiddenBanner: boolean = JSON.parse(this.storage.getItem('hiddenBanner'));

  passLimits: {[id: number]: PassLimit};

  public gridRestrictions: ToWhereGridRestriction = new ToWhereGridRestrictionLg();

  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'to-header': true,
    'to-header_animation-back': false
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formService: CreateFormService,
    public screenService: ScreenService,
    private storage: StorageService,
    private tooltipDataService: TooltipDataService,
    private locationService: LocationsService,
    private dialog: MatDialog
  ) {
    this.states = States;
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
    if (this.formState.data.teacherRooms && !this.dialogData['kioskMode']) {
      this.teacherRooms = this.formState.data.teacherRooms;
    }
    this.gridRestrictions = this.getViewRestriction();
    this.frameMotion$.subscribe((v: any) => {
      switch (v.direction) {
        case 'back':
          this.headerTransition['to-header'] = false;
          this.headerTransition['to-header_animation-back'] = true;
          break;
        case 'forward':
          this.headerTransition['to-header'] = true;
          this.headerTransition['to-header_animation-back'] = false;
          break;
        default:
          this.headerTransition['to-header'] = true;
          this.headerTransition['to-header_animation-back'] = false;
      }
    });

    this.locationService.pass_limits_entities$.subscribe(res => {
      this.passLimits = res;
    });
  }

  isValidPinnable(pinnable: Pinnable) {
    if (pinnable.location.id === this.location.id)
      return false;

    if (this.isStaff && !this.formState.kioskMode)
      return true;

    if (!this.tooltipDataService.reachedPassLimit( 'to', this.passLimits[+pinnable.location.id]))
      return false;

    if (
      (!this.formState.forLater &&
      pinnable.location.restricted &&
      pinnable.location.request_mode === 'all_teachers_in_room' &&
      pinnable.location.request_send_origin_teachers &&
      !this.location.teachers.length) ||
      (this.formState.forLater &&
      pinnable.location.scheduling_restricted &&
      pinnable.location.scheduling_request_mode === 'all_teachers_in_room' &&
      pinnable.location.scheduling_request_send_origin_teachers &&
      !this.location.teachers.length)
    ) {
      return false;
    }
    return true;
  }

  passLimitProtect(location, callback){
    let passLimit = this.passLimits[location.id];
    let passLimitReached = passLimit.max_passes_to_active && passLimit.max_passes_to == passLimit.to_count;
    if (passLimitReached) {
      const dialogRef = this.dialog.open(ToWherePassLimitDialog, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '200px',
        disableClose: true,
        data: {passLimit: passLimit.to_count}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.override) {
          setTimeout(() => {
            callback();
          }, 200);
        }
      });
    } else {
      callback();
    }
  }

  pinnableSelected(pinnable) {
    const emitSelectedPinnable = () => {
      if (this.formState.formMode.role === 1 && pinnable.type === 'location') {
        this.formService.setFrameMotionDirection('disable');
      } else {
        this.formService.setFrameMotionDirection('forward');
      }

      this.formService.scalableBoxController.next(true);

      setTimeout(() => {
        this.formState.previousState = 2;
        this.selectedPinnable.emit(pinnable);
      }, 100);
    };

    this.passLimitProtect(pinnable.location, emitSelectedPinnable);
  }

  locationSelected(location) {
    const emitSelectedLocation = () => {
      this.formService.setFrameMotionDirection('disable');
      this.formService.scalableBoxController.next(true);
      setTimeout(() => {
        this.selectedLocation.emit(location);
      }, 100);
    };

    this.passLimitProtect(location, emitSelectedLocation);
  }

  switchView(isGrid) {
    this.storage.setItem('isGrid', isGrid);
    this.isLocationList$.next(isGrid);
    this.removeBanner();
  }

  removeBanner() {
    this.hiddenBanner = true;
    this.storage.setItem('hiddenBanner', true);
  }

  back() {

    this.formService.scalableBoxController.next(false);

    // if (!this.screenService.isDeviceLargeExtra && this.formState.formMode.role === 1 && !this.formState.forLater && !this.formState.kioskMode) {
    //   // debugger
    //   this.formService.setFrameMotionDirection('disable');
    //   this.formService.compressableBoxController.next(true);
    // } else {
      this.formService.compressableBoxController.next(false);
      this.formService.setFrameMotionDirection('back');
    // }
    setTimeout(() => {
      if (!!this.date &&
        !!this.studentText &&
        (this.formState.previousStep === 2 || this.formState.previousStep === 4)
      ) {
        this.formState.step = 1;
        this.formState.previousStep = 3;
      } else {
        if (this.formState.formMode.formFactor === 3 && this.formState.data.date.declinable) {
            this.formState.step = 1;
        } else {
          if (this.formState.kioskMode) {
            this.formState.step = 2;
            this.formState.state = 4;
          } else {
              this.formState.data.direction.from = null;
              this.formState.state -= 1;
          }
        }
      }
      this.formState.previousState = 2;

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
