import {Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import {Invitation} from '../models/Invitation';
import {User} from '../models/User';
import {Location} from '../models/Location';
import {Util} from '../../Util';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import {getInnerPassName} from '../pass-tile/pass-display-util';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {Navigation} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {filter, switchMap, tap} from 'rxjs/operators';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {RequestsService} from '../services/requests.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {ScreenService} from '../services/screen.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {School} from '../models/School';
import {HttpService} from '../services/http-service';
import {DeviceDetection} from '../device-detection.helper';
import {NavbarDataService} from '../main/navbar-data.service';
import {DomCheckerService} from '../services/dom-checker.service';
import {scalePassCards} from '../animations';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss'],
  animations: [scalePassCards]
})
export class InvitationCardComponent implements OnInit {

  @Input() invitation: Invitation;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() forInput: boolean = false;
  @Input() formState: Navigation;
  @Input() selectedStudents: User[] = [];

  @Output() cardEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('cardWrapper') cardWrapper: ElementRef;

  selectedOrigin: Location;
  denyOpen: boolean = false;
  selectedDuration: number;
  selectedTravelType: string;
  user: User;
  performingAction: boolean;
  fromHistory;
  fromHistoryIndex;
  dateEditOpen: boolean;
  locationChangeOpen: boolean;

  frameMotion$: BehaviorSubject<any>;
  scaleCardTrigger$: Observable<string>;

  isModal: boolean;
  isSeen: boolean;
  cancelEditClick: boolean;
  header: string;
  options: any = [];
  currentSchool: School;

  constructor(
      public dialogRef: MatDialogRef<InvitationCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialog: MatDialog,
      private requestService: RequestsService,
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private createFormService: CreateFormService,
      private screenService: ScreenService,
      private http: HttpService,
      private navbarData: NavbarDataService,
      private domCheckerService: DomCheckerService
  ) {}

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get studentName() {
    return getInnerPassName(this.invitation);
  }

  get issuerName() {
    return this.invitation.issuer.isSameObject(this.user) ? 'Me' : this.invitation.issuer.first_name.substr(0, 1) + '. ' + this.invitation.issuer.last_name;
  }

    get gradient() {
        return 'radial-gradient(circle at 73% 71%, ' + this.invitation.color_profile.gradient_color + ')';
    }

    get studentText() {
      if (this.formState && this.formState.data.selectedGroup) {
          return this.formState.data.selectedGroup.title;
      } else {
          return (this.selectedStudents ?
              (this.selectedStudents.length > 2 ?
                  this.selectedStudents[0].display_name + ' and ' + (this.selectedStudents.length - 1) + ' more' :
                  this.selectedStudents[0].display_name + (this.selectedStudents.length > 1 ?
                  ' and ' + this.selectedStudents[1].display_name : '')) :
            this.invitation.student.display_name + ` (${this.studentEmail})`);
      }
    }

  get studentEmail() {
      return this.invitation.student.primary_email.split('@', 1)[0];
  }

  get status() {
    return this.invitation.status.charAt(0).toUpperCase() + this.invitation.status.slice(1);
  }

  get durationPlural() {
    return this.selectedStudents && this.selectedStudents.length > 1;
  }

  get invalidDate() {
    return Util.invalidDate(this.invitation.date_choices[0]);
  }

  ngOnInit() {
    this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
    this.frameMotion$ = this.createFormService.getFrameMotionDirection();
    this.currentSchool = this.http.getSchool();
    if (this.data['pass']) {
      this.isModal = true;
      this.invitation = this.data['pass'];
      this.forFuture = this.data['forFuture'];
      this.fromPast = this.data['fromPast'];
      this.forStaff = this.data['forStaff'];
      this.forInput = this.data['forInput'];
      this.fromHistory = this.data['fromHistory'];
      this.fromHistoryIndex = this.data['fromHistoryIndex'];
      this.selectedStudents = this.data['selectedStudents'];
    }
  if (this.invitation) {
    this.selectedOrigin = this.invitation.default_origin;
  }
    this.dataService.currentUser
    .pipe(this.loadingService.watchFirst)
    .subscribe(user => {
      this._zone.run(() => {
        this.user = user;
      });
    });
  }

  formatDateTime(date: Date) {
    return Util.formatDateTime(date);
  }

  changeLocation(){
    if(!this.locationChangeOpen){
      this.locationChangeOpen = true;
      const locationDialog = this.dialog.open(CreateHallpassFormsComponent, {
        panelClass: 'form-dialog-container',
        maxWidth: '100vw',
        backdropClass: 'invis-backdrop',
        data: {
          'forInput': false,
          'hasClose': true,
          'entryState': { step: 3, state: 1 },
          'originalToLocation': this.invitation.destination,
          'colorProfile': this.invitation.color_profile,
          'originalFromLocation': this.invitation['default_origin']}
      });

      locationDialog.afterClosed().pipe(filter(res => !!res)).subscribe(data => {
        this.locationChangeOpen = false;
        this.setLocation((data.data && data.data['fromLocation']) ? data.data['fromLocation'] : this.invitation['default_origin']);
      });
    }
  }

  setLocation(location: Location) {
    this.invitation.default_origin = location;
    this.selectedOrigin = location;
  }

  newInvitation() {
    this.performingAction = true;
    const body = {
      'students' : this.selectedStudents.map(user => user.id),
      'default_origin' : this.invitation.default_origin ? this.invitation.default_origin.id : null,
      'destination' : this.invitation.destination.id,
      'date_choices' : this.invitation.date_choices.map(date => date.toISOString()),
      'duration' : this.selectedDuration * 60,
      'travel_type' : this.selectedTravelType,
      'issuer_message': this.invitation.issuer_message
    };

    this.requestService.createInvitation(body).subscribe((data) => {
      if (DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) {
        this.dataService.openRequestPageMobile();
        this.navbarData.inboxClick$.next(true);
      }
      this.dialogRef.close();
    });
  }

  acceptInvitation() {
    this.performingAction = true;
    const body = {
      'start_time' : this.invitation.date_choices[0].toISOString(),
      'origin' : this.selectedOrigin.id
    };

    this.requestService.acceptInvitation(this.invitation.id, body).subscribe((data: any) => {
      this.dialogRef.close();
    });
  }

    changeDate(resend_request?: boolean) {
      if (!this.dateEditOpen) {
        this.dateEditOpen = true;
            this.dialogRef.close();
            const conf = {
                panelClass: 'form-dialog-container',
                maxWidth: '100vw',
                backdropClass: 'custom-backdrop',
                data: {
                    'entryState': {
                        step: 1,
                        state: 1
                    },
                    'forInput': false,
                    'missedRequest': !this.forStaff,
                    'originalToLocation': this.invitation.destination,
                    'colorProfile': this.invitation.color_profile,
                    'request': this.invitation,
                    'request_time': resend_request || this.invalidDate ? new Date() : this.invitation.date_choices[0],
                    'resend_request': resend_request
                }
            };

        const dateDialog = this.dialog.open(CreateHallpassFormsComponent, conf);

        dateDialog.afterClosed().pipe(
          tap(() => this.dateEditOpen = false),
          filter((res) => res && res.data.date && resend_request && this.forStaff),
            switchMap((state) => {
              const body = {
                  'students' : this.invitation.student.id,
                  'default_origin' : this.invitation.default_origin ? this.invitation.default_origin.id : null,
                  'destination' : +this.invitation.destination.id,
                  'date_choices' : [new Date(state.data.date.date).toISOString()],
                  'duration' : this.invitation.duration,
                  'travel_type' : this.invitation.travel_type
              };
              return this.requestService.createInvitation(body);
            }), switchMap(() => this.requestService.cancelInvitation(this.invitation.id, '')))
            .subscribe(console.log);
    }
    }

  denyInvitation(evt: MouseEvent) {
    // if (this.screenService.isDeviceMid) {
    //   this.cancelEditClick = !this.cancelEditClick;
    // }
    if(!this.denyOpen){
      const target = new ElementRef(evt.currentTarget);
      this.options = [];
      this.header = '';
      if (this.forInput) {
        this.formState.step = 3;
        this.formState.previousStep = 4;
        this.createFormService.setFrameMotionDirection('disable');
        this.cardEvent.emit(this.formState);
          return false;
      } else if (!this.forStaff) {
        this.options.push(
          this.genOption('Decline Pass Request', '#E32C66', 'decline', './assets/Cancel (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)' )
        );
        this.header = 'Are you sure you want to decline this pass request you received?';
      } else {
        if (this.invalidDate) {
            this.options.push(
              this.genOption('Change Date & Time to Resend', '#7f879d', 'resend')
            );
        }
        this.options.push(
          this.genOption('Delete Pass Request', '#E32C66', 'delete', './assets/Delete (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)')
        );
        this.header = 'Are you sure you want to delete this pass request you sent?';
      }

      // if (!this.screenService.isDeviceMid) {
        UNANIMATED_CONTAINER.next(true);
        this.denyOpen = true;
        const consentDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {'header': this.header, 'options': this.options, 'trigger': target}
        });

        consentDialog.afterClosed()
          .pipe(
            tap(() => UNANIMATED_CONTAINER.next(false))
          )
          .subscribe(action => {
          this.chooseAction(action);
        });
      // }

    }
  }

  chooseAction(action) {
    this.denyOpen = false;
    if (action === 'cancel') {
      this.dialogRef.close();
    } else if (action === 'decline') {
      const body = {
        'message' : ''
      };
      this.requestService.denyInvitation(this.invitation.id, body).subscribe((httpData) => {
        this.dialogRef.close();
      });
    } else if (action === 'delete') {
      const body = {
        'message' : ''
      };
      this.requestService.cancelInvitation(this.invitation.id, body).subscribe((httpData) => {
        this.dialogRef.close();
      });
    } else if (action === 'resend') {
      this.changeDate(true);
    }
  }

  genOption(display, color, action, icon?, hoverBackground?, clickBackground?) {
    return { display, color, action, icon, hoverBackground, clickBackground };
  }

  cancelClick() {
    this.cancelEditClick = false;
  }

  backdropClick() {
    this.cancelEditClick = false;
  }

  receiveOption(action: any) {
    this.chooseAction(action);
  }

  scaleCard({action, intervalValue}) {
    if (action === 'open') {
      const scale = 1 - (intervalValue / 300);
      this.cardWrapper.nativeElement.style.transform = `scale(${scale})`;
    } else if (action === 'close') {
      const scale = 0.953333 + (intervalValue / 300);
      this.cardWrapper.nativeElement.style.transform = `scale(${scale})`;
    }
  }
}
