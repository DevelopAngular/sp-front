import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Util } from '../../Util';
import { Request } from '../models/Request';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { MatDialog } from '@angular/material';
import {DataService} from '../services/data-service';
import {RequestsService} from '../services/requests.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {tap} from 'rxjs/operators';
import * as _ from 'lodash';
import {DeviceDetection} from '../device-detection.helper';

@Component({
  selector: 'app-inline-request-card',
  templateUrl: './inline-request-card.component.html',
  styleUrls: ['./inline-request-card.component.scss']
})
export class InlineRequestCardComponent implements OnInit {
  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen: boolean = false;

  constructor(
      private requestService: RequestsService,
      public dialog: MatDialog,
      private dataService: DataService,
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
      return [this.request.teacher];
  }

  get filteredTeachers() {
    return _.uniqBy(this.teacherNames, 'id');
  }

  ngOnInit() {
  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }

  cancelRequest(evt: MouseEvent){
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);

      let options = [];
      let header = '';

      options.push(this.genOption('Delete Pass Request','#E32C66','delete'));
      header = 'Are you sure you want to delete this pass request you sent?';
      UNANIMATED_CONTAINER.next(true)
      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': header, 'options': options, 'trigger': target}
      });

      cancelDialog.afterOpen().subscribe( () => {
        this.cancelOpen = true;
      });

      cancelDialog.afterClosed()
        .pipe(
          tap(() => UNANIMATED_CONTAINER.next(false))
        )
        .subscribe(action => {
        this.cancelOpen = false;
          if (action === 'delete') {
              this.requestService.cancelRequest(this.request.id).subscribe((data) => {
                  console.log('[Request Canceled]: ', data);
              });
          }
        });
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
      'teacher' : this.request.teacher.id,
      // !forFuture means that request_time is definitely null
      'duration' : this.request.duration,
    };

    this.requestService.createRequest(body).subscribe(() => {
        this.requestService.cancelRequest(this.request.id).subscribe(() => {
        console.log('pass request resent');
      });
    });

  }

  genOption(display, color, action){
    return {display: display, color: color, action: action}
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
