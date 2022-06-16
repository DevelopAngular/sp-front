import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {Observable, of, forkJoin} from 'rxjs';
import {take, map} from 'rxjs/operators';

import {User} from '../models/User';
import {LocationsService} from '../services/locations.service';
import {UserService} from '../services/user.service';
import {NotificationService} from '../services/notification-service';
import {DeviceDetection} from '../device-detection.helper';
import {NotificationRoomFormComponent} from './notification-room-form/notification-room-form.component';
import {HallPassesService} from '../services/hall-passes.service';


@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit {

  user: User;
  rooms: Observable<any[]> = of([]);
  form: FormGroup = new FormGroup({});

  constructor(
    private dialogRef: MatDialogRef<NotificationFormComponent>,
    private userService: UserService,
    private locationsService: LocationsService,
    private hallPassService: HallPassesService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
  }

  get isDisabledNotif() {
    return !NotificationService.hasPermission;
  }

  get isSafari() {
    return DeviceDetection.isSafari();
  }

  get hasEmail() {
    return !this.user.primary_email.endsWith('spnx.local');
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get isUserLoaded() {
    return this.user !== undefined;
  }

  get isStudent() {
    return this.user.isStudent();
  }

  get isAdmin() {
    return this.user.isAdmin();
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

    return controls.some(control => this.form.get(control).value) && this.hasEmail;
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
      return this.user.primary_email;
    } else {
      return 'Email notifications are not supported for usernames';
    }
  }

  ngOnInit() {
    if (this.data && this.data['profile']) {
      this.user = User.fromJSON(this.data['profile']);
    } else {
      this.userService.user$
        .subscribe(user => {
          this.user = User.fromJSON(user);
        });
    }

    this.form = this.generateForm();
    this.rooms = this.generateRooms();
    this.rooms.subscribe(rooms => {
      rooms.forEach(room => {
        this.getRoomsArray().push(this.fb.group({
          to: true,
          from: true,
          expired: true,
        }));
      });
    });
  }

  getRoomsArray() {
    return this.form.get('myRooms') as FormArray;
  }

  roomBackground(gradient): string {
    const colors = gradient.split(',');
    return `radial-gradient(circle at 73% 71%, ${colors[0]} 0%, ${colors[1]} 144%)`;
  }

  activeNotifications(type) {
    const push = this.form.controls[type + 'Push']?.value;
    const email = this.form.controls[type + 'Email']?.value;
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

  activeRoomsNotifications(i) {
    const room = this.getRoomsArray().at(i) as FormGroup;
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
    this.userService.sendTestNotification(this.user.id).subscribe(res => {
    });
  }

  close() {
    this.dialogRef.close();
  }

  openRoomInfo(room, i) {
    this.dialog.open(NotificationRoomFormComponent, {
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        room: room,
        roomData: this.getRoomsArray().at(i) as FormGroup,
      },
      height: '285px',
      width: '450px',
    }).afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  generateRooms(): Observable<any[]> {
    return forkJoin([
      this.locationsService.getLocationsWithTeacher(this.user),
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

  generateForm(): FormGroup {
    if (this.isStudent) {
      return new FormGroup({});
    }

    const result = this.fb.group({
      passRequestsPush: [true],
      passRequestsEmail: [true],
      scheduledPassesPush: [true],
      scheduledPassesEmail: [true],
      myRoomsPush: [true],
      myRooms: this.fb.array([]),
      studentPassesPush: [true],
      studentPassesEmail: [true],
    });

    if (this.isAdmin) {
      result.addControl('reportsEmail', this.fb.control({value: true}));
      result.addControl('encounterPreventionEmail', this.fb.control({value: true}));
      result.addControl('weeklySummaryEmail', this.fb.control({value: true}));
    }

    return result;
  }
}
