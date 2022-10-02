import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Util} from '../../Util';
import {Request} from '../models/Request';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {DataService} from '../services/data-service';
import {RequestsService} from '../services/requests.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {concatMap, takeUntil, tap} from 'rxjs/operators';
import {uniqBy} from 'lodash';
import {DeviceDetection} from '../device-detection.helper';
import {BehaviorSubject, interval, Subject} from 'rxjs';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {HallPassesService} from '../services/hall-passes.service';
import {ScreenService} from '../services/screen.service';
import {StorageService} from '../services/storage.service';
import {PassLimitDialogComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/pass-limit-dialog/pass-limit-dialog.component';
import {PassLimit} from '../models/PassLimit';
import {LocationsService} from '../services/locations.service';

@Component({
  selector: 'app-inline-request-card',
  templateUrl: './inline-request-card.component.html',
  styleUrls: ['./inline-request-card.component.scss']
})
export class InlineRequestCardComponent implements OnInit, OnDestroy {
  @Input() request: Request;
  @Input() forFuture = false;
  @Input() fromPast = false;
  @Input() forInput = false;
  @Input() isOpenBigPass = false;
  @Input() fullScreen = false;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen = false;
  frameMotion$: BehaviorSubject<any>;
  cancelEditClick: boolean;
  header: any;
  options = [];
  solidColorRgba: string;
  solidColorRgba2: string;
  removeShadow: boolean;
  leftTextShadow: boolean;
  passLimits: {[id: number]: PassLimit};

  hoverDestroyer$: Subject<any>;

  activeTeacherPin: boolean;
  activeRoomCodePin: boolean;

  constructor(
      private requestService: RequestsService,
      public dialog: MatDialog,
      private dataService: DataService,
      private formService: CreateFormService,
      private screenService: ScreenService,
      private renderer: Renderer2,
      private passesService: HallPassesService,
      private storage: StorageService,
      private locationsService: LocationsService,
  ) { }

  get hasDivider() {
    if (!!this.request) {
      return this.request.status === 'pending' && !this.forInput;
    }
  }

  get gradient() {
      return 'radial-gradient(circle at 73% 71%, ' + this.request.color_profile.gradient_color + ')';
  }

  get teacherNames() {
      const destination = this.request.destination;
      const origin = this.request.origin;
      if (destination.request_mode === 'all_teachers_in_room') {
          if (destination.request_send_origin_teachers && destination.request_send_destination_teachers) {
              return [...destination.teachers, ...origin.teachers];
          } else if (destination.request_send_origin_teachers) {
              return origin.teachers;
          } else if (destination.request_send_destination_teachers) {
              return destination.teachers;
          }
      }
      return this.request['teachers'];
  }

  get filteredTeachers() {
    return uniqBy(this.teacherNames, 'id');
  }

  ngOnInit() {
    if (JSON.parse(this.storage.getItem('pass_full_screen')) && !this.fullScreen) {
      this.openBigPassCard();
    }
    if (this.request) {
      this.solidColorRgba = Util.convertHex(this.request.gradient_color.split(',')[0], 100);
      this.solidColorRgba2 = Util.convertHex(this.request.gradient_color.split(',')[1], 100);
    }
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.passesService.isOpenPassModal$.subscribe(res => {
      this.activeTeacherPin = !res;
    });

    this.locationsService.getPassLimitRequest();
    this.locationsService.pass_limits_entities$.subscribe(res => {
      this.passLimits = res;
    });
  }

  ngOnDestroy() {
    this.closeDialog();
  }

  formatDateTime() {
    return Util.formatDateTime(this.request.request_time);
  }

  cancelRequest(evt: MouseEvent) {
    if (!this.cancelOpen) {
      const target = new ElementRef(evt.currentTarget);


      this.header = '';
      this.options = [];

      this.options.push(this.genOption('Delete Pass Request', '#E32C66', 'delete', './assets/Delete (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)'));
      this.header = 'Are you sure you want to delete this pass request you sent?';

      // if (!this.screenService.isDeviceMid) {
        this.cancelOpen = true;
        UNANIMATED_CONTAINER.next(true);
        const cancelDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {'header': this.header, 'options': this.options, 'trigger': target}
        });

        cancelDialog.afterClosed()
          .pipe(
            tap(() => UNANIMATED_CONTAINER.next(false))
          )
          .subscribe(action => {
            this.cancelOpen = false;
            this.chooseAction(action);
          });
      // }

    }
  }

  resendRequest() {
    if (this.forFuture) {
      // TODO(2019-01-07) a lot of the resend logic in request-card and inline-request-card should probably be unified.
      throw new Error('Changing date time not currently supported by this component.');
    }

    const body: any = {
      'origin' : this.request.origin.id,
      'destination' : this.request.destination.id,
      'attachment_message' : this.request.attachment_message,
      'travel_type' : this.request.travel_type,
      'teachers': this.request.teachers.map(u => parseInt(u.id, 10)),
      // !forFuture means that request_time is definitely null
      'duration' : this.request.duration,
    };

    this.requestService.createRequest(body).pipe(
      concatMap(() => this.requestService.cancelRequest(this.request.id))
    ).subscribe({
      next: () => {
        this.closeDialog();
        console.log('pass request resent');
      },
      error: console.log
    });
  }

  genOption(display, color, action, icon?, hoverBackground?, clickBackground?) {
    return { display, color, action, icon, hoverBackground, clickBackground };
  }

  onHover(evt: HTMLElement, container: HTMLElement) {
    this.hoverDestroyer$ = new Subject<any>();
    const target = evt;
    target.style.width = `auto`;
    target.style.transition = `none`;

    const targetWidth = target.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;

    let margin = 0;
    interval(35)
      .pipe(
        takeUntil(this.hoverDestroyer$)
      )
      .subscribe(() => {
        if (margin > 0) {
          this.leftTextShadow = true;
        }
        if ((targetWidth - margin) > containerWidth) {
          target.style.marginLeft = `-${margin}px`;
          margin++;
        } else {
          this.removeShadow = true;
        }
      });
  }

  onLeave(target: HTMLElement) {
    target.style.marginLeft = this.filteredTeachers.length > 1 ? '0px' : '10px';
    target.style.transition = `margin-left .4s ease`;
    target.style.width = `auto`;
    this.removeShadow = false;
    this.leftTextShadow = false;
    this.hoverDestroyer$.next();
    this.hoverDestroyer$.complete();
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  receiveOption($event: any) {
    this.chooseAction($event);
  }

  chooseAction(action) {
    if (action === 'delete') {
      this.requestService.cancelRequest(this.request.id).subscribe((data) => {
        this.closeDialog();
        console.log('[Request Canceled]: ', data);
        const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
        if (storageData && storageData[this.request.id]) {
          delete storageData[this.request.id];
          this.storage.setItem('pinAttempts', JSON.stringify({...storageData}));
        }
      });
    }
    this.closeMenu();
  }

  closeMenu() {
    this.cancelEditClick = false;
    this.renderer.setStyle(document.body, 'overflow', 'auto');
  }

  closeDialog() {
    this.screenService.closeDialog();
  }

  openBigPassCard() {
    this.storage.setItem('pass_full_screen', !this.isOpenBigPass);
    this.screenService.openBigPassCard(this.isOpenBigPass, this.request, 'inlineRequest');
  }

  goToPin() {
    return new Promise<boolean>(resolve => {
      if (!(this.request.destination.id in this.passLimits)) {
        this.activeTeacherPin = true;
        return;
      }

      const passLimit = this.passLimits[this.request.destination.id];
      const passLimitReached = passLimit.max_passes_to_active && passLimit.max_passes_to < (passLimit.to_count + 1);
      if (!passLimitReached) {
        this.activeTeacherPin = true;
        return;
      }


      const dialogRef = this.dialog.open(PassLimitDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        width: '450px',
        height: '215px',
        disableClose: true,
        data: {
          passLimit: passLimit.max_passes_to,
          studentCount: 1,
          currentCount: passLimit.to_count,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.override) {
          setTimeout(() => {
            this.activeTeacherPin = true;
          }, 200);
        }
      });
    });
  }
}
