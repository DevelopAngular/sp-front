import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

import {Observable, of, forkJoin, Subject, BehaviorSubject} from 'rxjs';
import {take, map, switchMap, filter} from 'rxjs/operators';
import {isEqual} from 'lodash';

import {User} from '../models/User';
import {LocationsService} from '../services/locations.service';
import {UserService} from '../services/user.service';
import {NotificationService, UserNotificationSettings} from '../services/notification-service';
import {DeviceDetection} from '../device-detection.helper';
import {NotificationRoomFormComponent} from './notification-room-form/notification-room-form.component';
import {HallPassesService} from '../services/hall-passes.service';


@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit, OnDestroy {

  user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  rooms$: Observable<any[]> = of([]);
  form: FormGroup = null;

  constructor(
    private dialogRef: MatDialogRef<NotificationFormComponent>,
    private userService: UserService,
    private locationsService: LocationsService,
    private notificationService: NotificationService,
    private hallPassService: HallPassesService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
  }

  originalFormValue: object;

  ngOnInit() {
    if (this.data && this.data['profile']) {
      this.user$.next(User.fromJSON(this.data['profile']));
    } else {
      this.userService.user$
        .subscribe(user => {
          this.user$.next(User.fromJSON(user));
        });
    }

    const settings$: Subject<any> = new Subject();
    this.user$.pipe(switchMap(user => this.notificationService.getUserNotification(user)))
      .subscribe((settings: UserNotificationSettings) => {
        this.form = this.generateForm(settings);
        settings$.next(settings);
        settings$.complete();
      });

    this.rooms$ = this.generateRooms();

    forkJoin([settings$, this.rooms$]).subscribe(
      ([settings, rooms]: [UserNotificationSettings, any[]]) => {
        const roomIds = [];
        rooms.forEach(room => {
          let roomSettings;
          roomIds.push(room.id);
          if (room.id in settings.myRooms) {
            roomSettings = this.fb.group(settings.myRooms[room.id]);
          } else {
            roomSettings = this.fb.group({
              to: true,
              from: true,
              expired: true,
            });
          }

          this.getRooms().addControl(room.id, roomSettings);
        });

        const roomsToRemove = [];
        Object.entries(settings?.myRooms || []).forEach((roomId) => {
          if (!roomIds.includes(roomId[0])) {
            roomsToRemove.push(roomId[0]);
          }
        });
        roomsToRemove.forEach(roomId => {
          delete settings.myRooms[roomId];
        });

        // only here the form is fully initialized
        this.originalFormValue = this.form.value;
      });
  }

  ngOnDestroy(): void {
    // accurate way to tell the form has changed
    if (isEqual(this.form.value, this.originalFormValue)) {
      return;
    }

    this.user$.subscribe(user => {
      this.notificationService.updateUserNotification(user, this.form.getRawValue()).subscribe();
    });
  }

  get isDisabledNotif() {
    return !NotificationService.hasPermission;
  }

  get isSafari() {
    return DeviceDetection.isSafari();
  }

  get hasEmail() {
    if (this.user$.value == null) {
      return false;
    }

    return !this.user$.value.primary_email.endsWith('spnx.local');
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get isUserLoaded() {
    return this.user$.value != null;
  }

  get isStudent() {
    if (this.user$.value == null) {
      return true;
    }

    return this.user$.value.isStudent();
  }

  get isAdmin() {
    return this.user$.value.isAdmin();
  }

  get isUsingEmail() {
    const controls = [
      'passRequestsEmail',
      'scheduledPassesEmail',
      'studentPassesEmail',
      'reportsEmail',
      'encounterPreventionEmail',
      'weeklySummaryEmail',
    ];

    return controls.some(control => this.form.get(control)?.value) && this.hasEmail;
  }

  get isUsingPush() {
    const controls = [
      'passRequestsPush',
      'scheduledPassesPush',
      'myRoomsPush',
      'studentPassesPush',
    ];

    return controls.some(control => this.form.get(control).value);
  }

  get studentBottomText() {
    if (!this.hasEmail) {
      return 'Notifications will be sent to your email.';
    } else if (!this.isSafari) {
      return 'Notifications will be sent to this browser.';
    } else {
      return false;
    }
  }

  get emailByline() {
    if (this.hasEmail) {
      return this.user$.value.primary_email;
    } else {
      return 'Email notifications are not supported for usernames';
    }
  }

  get students() {
    return this.form.get('studentIds') as FormArray;
  }

  getRooms() {
    return this.form.get('myRooms') as FormGroup;
  }

  getRoom(id: string): FormGroup {
    if (this.getRooms().contains(id)) {
      return this.getRooms().controls[id] as FormGroup;
    }
    return null;
  }

  roomBackground(gradient): string {
    const colors = gradient.split(',');
    return `radial-gradient(circle at 73% 71%, ${colors[0]} 0%, ${colors[1]} 144%)`;
  }

  activeNotifications(type: string): string {
    const $push = this.form.controls[type + 'Push'];
    const $email = this.form.controls[type + 'Email'];
    // TODO uncomment bellow and the log will be shown continuosly in the console
    //console.log($email?.value)
    const push = $push?.value;
    const email = $email?.value;
    if (push && email) {
      return 'Push, Email';
    } else if (push) {
      return 'Push';
    } else if (email) {
      return 'Email';
    } else {
      return 'Off';
    }
  }

  activeRoomsNotifications(roomId: string): string {
    const room = this.getRoom(roomId);
    if (room == null) {
      return '';
    }

    let result = [];
    if (room.get('to').value) {
      result.push('To');
    }
    if (room.get('from').value) {
      result.push('From');
    }
    if (room.get('expired').value) {
      result.push('Expired');
    }
    if (result.length === 0) {
      result = ['Off'];
    }

    return result.join(', ');
  }

  send() {
    if (this.user$.value == null) {
      return;
    }

    this.userService.sendTestNotification(this.user$.value.id).subscribe();
  }

  close() {
    this.dialogRef.close();
  }

  openRoomInfo(room) {
    const roomControl = this.getRoom(room.id as string);
    if (roomControl == null) {
      return;
    }

    this.dialog.open(NotificationRoomFormComponent, {
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        room: room,
        roomData: roomControl,
      },
      height: '285px',
      width: '450px',
    }).afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  generateRooms(): Observable<any[]> {
    return forkJoin([
      this.user$
        .pipe(filter<User>(Boolean))
        .pipe(switchMap(user => this.locationsService.getLocationsWithTeacher(user)))
        .pipe(take(1)),
      this.hallPassService.getPinnables().pipe(take(1)),
    ]).pipe(map(data => {
      const locations = data[0];
      const pinnables = data[1];
      if (pinnables == null) {
        return [];
      }

      return locations.map(location => {
        for (let i = 0; i < pinnables.length; i++) {
          if (location.id === pinnables[i].id || location.category === pinnables[i].category) {
            return {
              'id': location['id'],
              'title': location['title'],
              'color_profile': pinnables[i]['color_profile'],
              'icon': pinnables[i]['icon'],
            };
          }
        }
        return null;
      }).filter(item => item !== null);
    }));
  }

  generateForm(settings: UserNotificationSettings): FormGroup {
    if (this.isStudent) {
      return new FormGroup({});
    }

    let students = [];
    if (((settings as any)['students'] ?? []).length > 0) {
      students = settings['students'].map((s: any) => s?.id).filter(Boolean);
    }

    const result = this.fb.group({
      passRequestsPush: [settings.passRequestsPush],
      passRequestsEmail: [settings.passRequestsEmail],
      scheduledPassesPush: [settings.scheduledPassesPush],
      scheduledPassesEmail: [settings.scheduledPassesEmail],
      myRoomsPush: [settings.myRoomsPush],
      myRooms: this.fb.group({}),
      studentPassesPush: [settings.studentPassesPush],
      studentPassesEmail: [settings.studentPassesEmail],
      studentIds: this.fb.array(students),
      settingsVersion: [settings.settingsVersion],
    });

    if (this.isAdmin) {
      result.addControl('reportsEmail', this.fb.control(settings.reportsEmail));
      result.addControl('encounterPreventionEmail', this.fb.control(settings.encounterPreventionEmail));
      result.addControl('weeklySummaryEmail', this.fb.control(settings.weeklySummaryEmail));
    }

    return result;
  }

  setForm(): void {

  }
}
