import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { User } from '../models/User';
import { DataService } from '../services/data-service';
import { LocationsService } from '../services/locations.service';
import { LoadingService } from '../services/loading.service';
import {UserService} from '../services/user.service';
import {Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit, OnDestroy {

  settings;

  user: User;

  private change$: Subject<{id: string, value: boolean}> = new Subject<{id: string, value: boolean}>();

  private destroy$ = new Subject();

  notifForm: FormGroup = new FormGroup({});

  constructor(
      private dataService: DataService,
      private loadingService: LoadingService,
      private _zone: NgZone,
      private locService: LocationsService,
      public dialogRef: MatDialogRef<NotificationFormComponent>,
      private userService: UserService
  ) {}

  ngOnInit() {
      this.dataService.currentUser
      .subscribe(user => {
          this._zone.run(() => {
              this.user = user;
          });
      });

      this.userService.getUserNotification().pipe(takeUntil(this.destroy$)).subscribe(res => {
          this.settings = res;
          this.buildForm();
      });

      this.change$.pipe(takeUntil(this.destroy$), switchMap(({id, value}) => {
          if (value) {
              return this.userService.enableNotification(id);
          } else {
              return this.userService.disableNotification(id);
          }
      })).subscribe(console.log);

      // this.notificationsSubscription = this.locService.getLocationsWithTeacher(this.user)
      //     .subscribe((res: Location[]) => {
      //         const roomsControls = [];
      //         res.forEach((room: any) => {
      //           roomsControls.push({controlTitle: `Pass From ${room.title}`, formControl: `from_${room.title}`});
      //           roomsControls.push({controlTitle: `Pass To ${room.title}`, formControl: `to_${room.title}`});
      //         });
      //         if (this.user.isTeacher()) {
      //           this.settings.push(
      //             {
      //                 title: 'Pass Requests',
      //                 controls: [
      //                     { controlTitle: 'New Pass Requests', formControl: 'new_pass_request' },
      //                     { controlTitle: 'Pass Request Updates', controlSubtitle: 'Alerts when a pass is accepted or declined by a student.', formControl: 'pass_request_updates' }
      //                 ]
      //             },
      //             {
      //                 title: 'Scheduled Passes',
      //                 controls: [
      //                     { controlTitle: 'Scheduled Pass Updates', controlSubtitle: 'Alerts if a scheduled pass is deleted.', formControl: 'pass_updates' }
      //                 ]
      //             },
      //             {
      //                 title: 'My Room',
      //                 controls: roomsControls
      //             }
      //           );
      //         } else {
      //             this.settings.push({
      //                     title: 'Active Passes',
      //                     controls: [
      //                         { controlTitle: '1 Minute Left Alert', formControl: 'left_alert' },
      //                         { controlTitle: 'Pass Expiration Alert', formControl: 'expiration_alert' },
      //                         { controlTitle: 'New Pass From Teacher', formControl: 'pass_from_teacher' },
      //                     ]
      //                 },
      //                 {
      //                     title: 'Scheduled Passes',
      //                     controls: [
      //                         { controlTitle: 'New Scheduled Pass', formControl: 'scheduled_pass' },
      //                         { controlTitle: 'Upcoming Scheduled Pass', formControl: 'upcoming_scheduled_pass' },
      //                         { controlTitle: 'Scheduled Pass Started', formControl: 'pass_started' },
      //                         { controlTitle: 'Scheduled Pass Updates', controlSubtitle: 'Alerts if a scheduled pass is deleted.', formControl: 'pass_updates' }
      //                     ]
      //                 },
      //                 {
      //                     title: 'Pass Requests',
      //                     controls: [
      //                         { controlTitle: 'New Pass Requests', formControl: 'new_pass_request' },
      //                         { controlTitle: 'Pass Request Updates', controlSubtitle: 'Alerts when a pass is accepted or declined by a student.', formControl: 'pass_request_updates' }
      //
      //                     ]
      //                 }
      //                 );
      //         }
      //         this.buildForm();
      //     });
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

}
