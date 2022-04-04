import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';

import {Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

import {User} from '../models/User';
import {DataService} from '../services/data-service';
import {LocationsService} from '../services/locations.service';
import {LoadingService} from '../services/loading.service';
import {UserService} from '../services/user.service';
import {NotificationService} from '../services/notification-service';
import {DeviceDetection} from '../device-detection.helper';


@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit, OnDestroy {

  settings;

  user: User;

  loaded: boolean;

  private change$: Subject<{id: string, value: boolean}> = new Subject<{id: string, value: boolean}>();

  private destroy$ = new Subject();

  notifForm: FormGroup = new FormGroup({});

  constructor(
      private dataService: DataService,
      private loadingService: LoadingService,
      private _zone: NgZone,
      private locService: LocationsService,
      public dialogRef: MatDialogRef<NotificationFormComponent>,
      private userService: UserService,
      @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  get isDisabledNotif() {
      return NotificationService.hasPermission;
  }

  get isSafari() {
    return DeviceDetection.isSafari();
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  ngOnInit() {
    if (this.data && this.data['profile']) {
      this.user = this.data['profile'];
    } else {
      this.userService.user$
        .subscribe(user => {
          this.user = user;
        });
    }

    this.userService.getUserNotification(this.user.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.settings = res;
        this.loaded = true;
        this.buildForm();
    });

    this.change$.pipe(takeUntil(this.destroy$), switchMap(({id, value}) => {
        if (value) {
            return this.userService.enableNotification(id);
        } else {
            return this.userService.disableNotification(id);
        }
    })).subscribe(console.log);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeForm({value, id}) {
      this.change$.next({id, value});
  }

  buildForm() {
    const notifications = [];
    this.settings.forEach(setting => {
       notifications.push(...setting.notifications);
    });
    notifications.forEach(notification => {
        this.notifForm.addControl(notification.id, new FormControl(notification.value));
    });

  }

  send() {
    this.userService.sendTestNotification(this.user.id).subscribe(res => {
    });
  }
}
