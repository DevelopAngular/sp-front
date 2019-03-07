import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit {

  settings = [
    {
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
    }
  ];

  notifForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<NotificationFormComponent>) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
  }

}
