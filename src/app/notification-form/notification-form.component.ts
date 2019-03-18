import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { User } from '../models/User';
import { DataService } from '../services/data-service';
import { LocationsService } from '../services/locations.service';
import { LoadingService } from '../services/loading.service';

export interface Control {
    controlTitle: string;
    controlSubtitle?: string;
    formControl: string;
}
export interface Setting {
    title: string;
    controls: Control[];
}

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit, OnDestroy {

  settings: Setting[] = [];

  user: User;

  userSubscription: Subscription;
  locationsSubscription: Subscription;

  notifForm: FormGroup = new FormGroup({});

  constructor(
      private dataService: DataService,
      private loadingService: LoadingService,
      private _zone: NgZone,
      private locService: LocationsService,
      public dialogRef: MatDialogRef<NotificationFormComponent>
  ) {}

  ngOnInit() {
      this.userSubscription = this.dataService.currentUser
      .subscribe(user => {
          this._zone.run(() => {
              this.user = user;
          });
      });
      this.locationsSubscription = this.locService.getLocationsWithTeacher(this.user)
          .subscribe((res: Location[]) => {
              const roomsControls = [];
              res.forEach((room: any) => {
                roomsControls.push({controlTitle: `Pass From ${room.title}`, formControl: `from_${room.title}`});
                roomsControls.push({controlTitle: `Pass To ${room.title}`, formControl: `to_${room.title}`});
              });
              this.settings.push({
                  title: 'Active Passes',
                  controls: [
                      { controlTitle: '1 Minute Left Alert', formControl: 'left_alert' },
                      { controlTitle: 'Pass Expiration Alert', formControl: 'expiration_alert' },
                      { controlTitle: 'New Pass From Teacher', formControl: 'pass_from_teacher' },
                  ]
              },
                  {
                      title: 'Scheduled Passes',
                      controls: [
                          { controlTitle: 'New Scheduled Pass', formControl: 'scheduled_pass' },
                          { controlTitle: 'Upcoming Scheduled Pass', formControl: 'upcoming_scheduled_pass' },
                          { controlTitle: 'Scheduled Pass Started', formControl: 'pass_started' },
                          { controlTitle: 'Scheduled Pass Updates', controlSubtitle: 'Alerts if a scheduled pass is deleted.', formControl: 'pass_updates' }
                      ]
                  },
                  {
                      title: 'Pass Requests',
                      controls: [
                          { controlTitle: 'New Pass Requests', formControl: 'new_pass_request' },
                          { controlTitle: 'Pass Request Updates', controlSubtitle: 'Alerts when a pass is accepted or declined by a student.', formControl: 'pass_request_updates' }
                      ]
                  });
              if (roomsControls.length > 0) {
                  this.settings.push({ title: 'My Room', controls: roomsControls });
              }
              this.buildForm();
          });
  }

  ngOnDestroy() {
      this.userSubscription.unsubscribe();
      this.locationsSubscription.unsubscribe();
  }

  buildForm() {
    const controls = [];
    this.settings.forEach(setting => {
       controls.push(...setting.controls);
    });
    controls.forEach(control => {
        this.notifForm.addControl(control.formControl, new FormControl(true));
    });

  }

}
