import {Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ToastService} from '../../../../services/toast.service';
import {Pinnable} from '../../../../models/Pinnable';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {States} from '../locations-group-container.component';
import {ScreenService} from '../../../../services/screen.service';
import {ToWhereGridRestriction} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestriction';
import {ToWhereGridRestrictionLg} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionLg';
import {ToWhereGridRestrictionSm} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionSm';
import {ToWhereGridRestrictionMd} from '../../../../models/to-where-grid-restrictions/ToWhereGridRestrictionMd';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {Subject, BehaviorSubject, fromEvent, Observable} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';
import {DeviceDetection} from '../../../../device-detection.helper';
import {StorageService} from '../../../../services/storage.service';
import {TooltipDataService} from '../../../../services/tooltip-data.service';
import {PassLimit} from '../../../../models/PassLimit';
import {LocationsService} from '../../../../services/locations.service';
import {PassLimitDialogComponent} from '../pass-limit-dialog/pass-limit-dialog.component';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../../../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {LocationVisibilityService} from '../../location-visibility.service';
import {UserService} from '../../../../services/user.service';
import {User} from '../../../../models/User';
import {Location} from '../../../../models/Location';

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

  @ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

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

  updatedLocation$: Observable<Location>;
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<ToWhereComponent>,
    private visibilityService: LocationVisibilityService,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formService: CreateFormService,
    public screenService: ScreenService,
    private storage: StorageService,
    private tooltipDataService: TooltipDataService,
    private locationsService: LocationsService,
    private dialog: MatDialog,
    private userService: UserService,
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

    this.locationsService.getPassLimitRequest();
    this.locationsService.pass_limits_entities$.subscribe(res => {
      this.passLimits = res;
    });

    if (this.formState.data.roomStudentsAfterFromStep) {
      this.formState.data.roomStudents = [...this.formState.data.roomStudentsAfterFromStep];
    }

   this.userService.userData
    .pipe(
      filter(u => !!u),
      take(1),
    )
    .subscribe((u: User) => this.student = u);

    this.updatedLocation$ = this.formService.getUpdatedChoice();
  }

  private student: User;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isValidPinnable(pinnable: Pinnable) {
    // === and ids are dangerous as ids are numeric strings or numbers
    // using == will pose its own dangers
    // if (pinnable.location.id == this.location.id)
    // as we know ids are numbers we cast them to pure numbers
    if (+pinnable.location.id === +this.location.id)
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

  countStudents(): number {
    let sum = 0;
    const selectedStudents = this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
    if (selectedStudents)
      sum += selectedStudents.length;
    return sum;
  }

  passLimitPromise(location) {
    return new Promise<boolean>(resolve => {
      const passLimit = this.passLimits[location.id];
      // passLimits has no location.id
      if (!passLimit){
        return resolve(true);
      }
      const passLimitReached = passLimit.max_passes_to_active && passLimit.max_passes_to < (passLimit.to_count + this.countStudents());
      if (!passLimitReached)
        return resolve(true);

      const dialogRef = this.dialog.open(PassLimitDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        width: '450px',
        height: '215px',
        disableClose: true,
        data: {
          passLimit: passLimit.max_passes_to,
          studentCount: this.countStudents(),
          currentCount: passLimit.to_count,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.override) {
          setTimeout(() => {
            return resolve(true);
          }, 200);
        } else
          return resolve(false);
      });
    });
  }

  pinnableSelected(pinnable) {
    const location = pinnable.location;

    const forwardAndEmit = () => {
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

    const emitSelectedPinnable = (allowed) => {
      if (!allowed) return;

      // is folder
      if (!!pinnable.category && pinnable.location === null) {
        forwardAndEmit();
        return;
      }

      // students go forward
      if (!this.isStaff) {
        forwardAndEmit();
        return;
      }

     // staff only
     const selectedStudents = this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
     // skipped are students that do not qualify to go forward
     let skipped = this.visibilityService.calculateSkipped(selectedStudents, location);

      if (skipped.length === 0) {
        forwardAndEmit();
        return;
      }

      let text =  'This room is only available to certain students';
      let names = selectedStudents.filter(s => skipped.includes(''+s.id)).map(s => s.display_name);
      let title =  'Student does not have permission to go to this room';
      let denyText =  'Cancel';
      if (names.length > 1) {
        text = names?.join(', ') ?? 'This room is only available to certain students'
        title = 'These students do not have permission to go to this room:';
        denyText = 'Skip these students';
      } else {
        title = (names?.join(', ') ?? 'Student') + ' does not have permission to go to this room';
      }

      const roomStudents = selectedStudents.filter(s => (!skipped.includes(''+s.id)));
      const noStudentsCase = roomStudents.length === 0;
      
      if (noStudentsCase) denyText = 'Cancel';

      this.dialog.open(ConfirmationDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        closeOnNavigation: true,
        width: '450px',
        data: {
          headerText: '',
          body: this.confirmDialogVisibility,
          buttons: {
            confirmText: 'Override',
            denyText,
          },
          templateData: {alerts: [{title, text}]},
          icon: {
            name: 'Eye (Green-White).svg',
            background: '',
          }
        } as ConfirmationTemplates
      }).afterClosed().pipe(
        takeUntil(this.destroy$),
      ).subscribe(override => {
        this.formState.data.roomOverride = !!override;

        if (override === undefined) {
          return;
        }

        // override case
        if (override) {
          forwardAndEmit();
          return;
        }

        // SKIPPING case
        // avoid a certain no students case
        if (selectedStudents.length === 1) {
          //this.dialogRef.close();
          return;
        }

        if (noStudentsCase) {
          return;
        }

        this.formState.data.roomStudents = roomStudents;
        forwardAndEmit();
      });
    };

    if (pinnable.type !== 'location')
      return emitSelectedPinnable(true);
    else
      this.passLimitPromise(pinnable.location).then(emitSelectedPinnable);
  }

  /*
  private forwardAndEmit() {
    this.formService.setFrameMotionDirection('disable');
    this.formService.scalableBoxController.next(true);
    setTimeout(() => {
      this.selectedLocation.emit(location);
    }, 100);
  }*/

  locationSelected(location) {
    const forwardAndEmit = () => {
      this.formService.setFrameMotionDirection('disable');
      this.formService.scalableBoxController.next(true);
      setTimeout(() => {
        this.selectedLocation.emit(location);
      }, 100);
    };

    this.passLimitPromise(location).then((allowed) => {
      if (!allowed) return;

      // students go forward
      /*if (!this.isStaff) {
        this.formState.data.roomStudents = [this.student];
        forwardAndEmit();
        return;
      }

      this.visibilityService.howToActOnChooseLocation(
        this.formState,
        location,
        this.confirmDialogVisibility,
        this.forwardAndEmit.bind(this),
        this.destroy$,
      );*/

     // staff only
     const selectedStudents = this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
     // skipped are students that do not qualify to go forward
     let skipped = this.visibilityService.calculateSkipped(selectedStudents, location);

      if (skipped.length === 0) {
        forwardAndEmit();
        return;
      }

      let text =  'This room is only available to certain students';
      let names = selectedStudents.filter(s => skipped.includes(''+s.id)).map(s => s.display_name);
      let title =  'Student does not have permission to go to this room';
      let denyText =  'Cancel';
      if (names.length > 1) {
        text = names?.join(', ') ?? 'This room is only available to certain students'
        title = 'These students do not have permission to go to this room:';
        denyText = 'Skip these students';
      } else {
        title = (names?.join(', ') ?? 'Student') + ' does not have permission to go to this room';
      }

      this.dialog.open(ConfirmationDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        closeOnNavigation: true,
        data: {
          headerText: '',
          body: this.confirmDialogVisibility,
          buttons: {
            confirmText: 'Override',
            denyText,
          },
          templateData: {alerts: [{title, text}]},
          icon: {
            name: 'Eye (Green-White).svg',
            background: '',
          }
        } as ConfirmationTemplates
      }).afterClosed().pipe(
        takeUntil(this.destroy$),
      ).subscribe(override => {
        this.formState.data.roomOverride = !!override;

        if (override === undefined) {
          return;
        }

        // override case
        if (override) {
          forwardAndEmit();
          return;
        }

        // SKIPPING case
        // avoid a certain no students case
        if (selectedStudents.length === 1) return;

        this.formState.data.roomOverride = !!override;
        // filter out the skipped students
        const roomStudents = selectedStudents.filter(s => (!skipped.includes(''+s.id)));
        // avoid no students case
        if (roomStudents.length === 0) {
          this.toastService.openToast({
            title: 'Skiping will left no students to operate on',
            subtitle: 'Last operation did not proceeed',
            type: 'error',
          });
          return;
        }

        this.formState.data.roomStudents = roomStudents;
        forwardAndEmit();
      });
    });
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
