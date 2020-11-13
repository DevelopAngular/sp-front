import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Optional, Output} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {User} from '../models/User';
import {bumpIn, NextStep} from '../animations';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {StorageService} from '../services/storage.service';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {NotificationService} from '../services/notification-service';
import {DeviceDetection} from '../device-detection.helper';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotificationFormComponent} from '../notification-form/notification-form.component';

declare const window;

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  animations: [
    bumpIn,
    NextStep
  ]
})
export class IntroComponent implements OnInit, AfterViewInit {

  @Input() usedAsEntryComponent: boolean = false;
  @Output() endIntroEvent: EventEmitter<boolean> = new EventEmitter();

  user: User;
  isStaff: boolean;
  slideIndex: number = 1;
  buttons = {'left': false, 'right': false};
  slides;

  frameMotion$: BehaviorSubject<any>;

  introVersion = '23.46.2';

  allowLaterClicked: boolean;

  constructor(
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private router: Router,
      private storage: StorageService,
      private formService: CreateFormService,
      private userService: UserService,
      private deviceDetection: DeviceDetection,
      public  notifService: NotificationService,
      private cdr: ChangeDetectorRef,
      @Optional() private introDialogRef: MatDialogRef<IntroComponent>,
      @Optional() private dialog: MatDialog
  ) {
  }

  get isSafari() {
    return DeviceDetection.isSafari();
  }
  get alreadySeen() {
    if (this.isStaff) {
      return this.storage.getItem('smartpass_intro_teacher') === 'seen';
    } else {
      return this.storage.getItem('smartpass_intro_student') === 'seen';
    }
  }

  ngOnInit() {

    fromEvent(document, 'keydown').subscribe((evt: KeyboardEvent) => {

      if (evt.key === 'Tab') {
        evt.preventDefault();
        if (this.slideIndex === 5) {
          return;
        } else {
          this.slide('forward');
        }
      }
      if (evt.key === 'ArrowRight') {
        if (this.slideIndex === 5) {
          return;
        } else {
          this.slide('forward');
        }
      }
      if (evt.key === 'ArrowLeft') {
        if (this.slideIndex === 1) {
          return;
        } else {
          this.slide('back');
        }
      }

    });


    this.frameMotion$ = this.formService.getFrameMotionDirection();


    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.isTeacher() || user.isAssistant() || user.isAdmin();

          this.slides = {
            '#1': [
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Tomorrow, 9:03 AM',
                arrows: 'one'
              },
              {
                header: 'Gardner',
                gradient: '#F52B4F,#F37426',
                content: 'Sept 29, 11:35 AM',
                arrows: 'one'
              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two'
              },
            ],
            '#2': [
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Tomorrow, 9:03 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
              {
                header: 'Gardner',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 11:35 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
              {
                header: 'Piaget',
                gradient: '#F52B4F,#F37426',
                content: 'Sept 29, 10:14 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
            ],
            '#3': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two'

              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two'


              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two'

              },
              {
                header: 'Water Fountain',
                gradient: '  #1893E9,#05B5DE',
                content: 'Tuesday, 12:41 PM',
                arrows: 'two'
              },
            ],
            '#3.1': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two',
                footer: 'H.Keller'

              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two',
                footer: 'H.Keller'

              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two',
                footer: 'H.Keller'

              }
            ],
            '#3.2': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two',
                footer: 'B. Washington',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',


              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two',
                badge: true,
                footer: 'J.Locke',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',

              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two',
                footer: 'H.Keller',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png'

              }
            ],
            '#4': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Bathroom%20(White).png'
              },        {
                header: 'Water Fountain',
                gradient: '#1893E9,#05B5DE',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Water%20Fountain%20(White).png'
              },        {
                header: 'Classrooms',
                gradient: '#F52B4F,#F37426',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Classroom%20(White).png',
                arrow: true
              },        {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                solid: '#EAB219',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Counselor%20(White).png',
                restricted: true
              },        {
                header: 'MainOffice',
                gradient: '#5DBB21,#78D118',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Office%20(White).png'
              },        {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',
                restricted: true
              },        {
                header: 'Early Dismissal',
                gradient: '#13BF9E,#00D99B',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Bell%20(White).png',
                restricted: true
              },        {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Nurse%20(White).png'
              },        {
                header: 'Cafeteria',
                gradient: '#022F68,#2F66AB',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Cafeteria%20(White).png'
              }
            ],
            '#5': [
              {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'Tomorrow, 9:41 AM',
                arrows: 'two'
              },
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Denied',
                arrows: 'two',
                badge: true
              },
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Monday, 8:15 AM',
                arrows: 'one'
              }
            ],
            '#6': [
              {
                header: 'Early Dismissal',
                gradient: '#13BF9E,#00D99B',
                content: 'Today, 12:05 PM',
                arrows: 'one',
                badge: true
              },
              {
                header: 'Clark',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 8:57 AM',
                arrows: 'one',
              }
            ],
            '#6.1': [
              {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'Tomorrow, 9:41 AM',
                arrows: 'one',
                badge: true
              },
              {
                header: 'Clark',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 8:57 AM',
                arrows: 'one',
              }
            ],
          };
        });
        window.appLoaded(2000);
      });
  }

  ngAfterViewInit(): void {

  }

  clickDots(pageNumber) {
      this.slideIndex = pageNumber;
  }

  allowNotifications() {
    let notificationDialog;

    if (this.isSafari) {
      this.introDialogRef.close();
      notificationDialog = this.dialog.open(NotificationFormComponent, {
        panelClass: 'form-dialog-container',
        backdropClass: 'custom-backdrop',
      });
      return;
    }

    Notification.requestPermission().then( (result) => {
      if (result === 'denied') {
          this.introDialogRef.close();
            notificationDialog = this.dialog.open(NotificationFormComponent, {
            panelClass: 'form-dialog-container',
            backdropClass: 'custom-backdrop',
           });
      }
    });

    this.notifService.initNotifications(true)
      .then((hasPerm) => {
        localStorage.setItem('fcm_sw_registered', hasPerm.toString());
          this.allowLaterClicked = true;
          this.slide('forward');
      });
  }

  allowNotificationsLater() {
    this.allowLaterClicked = true;
    this.slide('forward');
    if (NotificationService.hasPermission) {
      this.notifService.initNotifications(true);
    }
  }

  endIntro() {
    let device;
    if (DeviceDetection.isAndroid()) {
      device = 'android';
    } else if (DeviceDetection.isIOSMobile()) {
      device = 'ios';
    } else {
      device = 'web';
    }
    this.userService.updateIntros(device, this.introVersion)
        .subscribe(res => {
            if (this.usedAsEntryComponent) {
                this.endIntroEvent.emit(true);
            } else {
                this.user.isAdmin() && !this.user.isTeacher() ? this.router.navigate(['/admin']) : this.router.navigate(['/main']);
            }
        });
  }

  onPress(press: boolean, id: string) {
    this.buttons[id] = press;
  }

  getButtonState(id: string) {
    return (this.buttons[id] ? 'down' : 'up');
  }

  slide(direction: string = 'forward') {
    const MIN_SLIDE = 1;
    const MAX_SLIDE = 4;

    switch (direction) {
      case 'forward':
          this.formService.setFrameMotionDirection('forward');
          setTimeout(() => {
            if ((this.isSafari || this.alreadySeen) && this.slideIndex === 3) {
              this.slideIndex += 2;
            } else if (this.slideIndex < MAX_SLIDE || this.allowLaterClicked)  {
              this.slideIndex++;
              this.allowLaterClicked = false;
            }
          }, 100);
        break;
      case'back':
        this.formService.setFrameMotionDirection('back');
        setTimeout(() => {
          if ((this.isSafari || this.alreadySeen) &&  this.slideIndex === 5 ) {
            this.slideIndex -= 2;
          } else if (this.slideIndex > MIN_SLIDE) {
            this.slideIndex--;
            this.allowLaterClicked = false;
          }
        }, 100);
        break;
    }
  }
}
