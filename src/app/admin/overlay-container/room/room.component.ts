import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

import { merge, Subject, zip } from 'rxjs';

import {OverlayDataService, Pages, RoomData} from '../overlay-data.service';
import {OptionState, ValidButtons} from '../advanced-options/advanced-options.component';

import { HallPassesService } from '../../../services/hall-passes.service';
import { LocationsService } from '../../../services/locations.service';
import { OverlayContainerComponent } from '../overlay-container.component';

import * as _ from 'lodash';
import {Location} from '../../../models/Location';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() roomDataResult: EventEmitter<RoomData> = new EventEmitter<RoomData>();

  data: RoomData = {
      roomName: 'New Room',
      roomNumber: '',
      timeLimit: 0,
      selectedTeachers: [],
      travelType: [],
      restricted: null,
      scheduling_restricted: null,
      advOptState: {
          now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
          future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
      }
  };

  initialData: RoomData;

  currentPage: number;
  tooltipText;

  advOptionsValidButtons: ValidButtons;

  roomValidButtons: ValidButtons;

  change$: Subject<any> = new Subject();

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      public overlayService: OverlayDataService,
      private hallPassService: HallPassesService,
      private locationService: LocationsService,
  ) {
  }

  get travelTypes() {
          if (this.data.travelType.includes('round_trip') &&
              this.data.travelType.includes('one_way')) {
              return 'Both';
          } else if (this.data.travelType.includes('round_trip')) {
              return 'Round-trip';
          } else if (this.data.travelType.includes('one_way')) {
              return 'One-way';
          }
  }

  get restricted() {
      if (!_.isNull(this.data.restricted)) {
          if (this.data.restricted) {
              return 'Restricted';
          } else {
              return 'Unrestricted';
          }
      }
  }

  get schedulingRestricted() {
      if (!_.isNull(this.data.scheduling_restricted)) {
          if (this.data.scheduling_restricted) {
              return 'Restricted';
          } else {
              return 'Unrestricted';
          }
      }
  }

  get advDisabledOptions() {
     if (!this.data.selectedTeachers.length) {
        return ['Any teachers assigned', 'All teachers assigned'];
     }
  }

  ngOnInit() {
      this.tooltipText = this.overlayService.tooltipText;
      this.currentPage = this.overlayService.pageState.getValue().currentPage;

      if (this.overlayService.pageState.getValue().data) {
          if (this.currentPage === Pages.EditRoom) {
              const pinnable = this.overlayService.pageState.getValue().data.pinnable;
              this.data = {
                  roomName: pinnable.location.title,
                  roomNumber: pinnable.location.room,
                  travelType: pinnable.location.travel_types,
                  selectedTeachers: pinnable.location.teachers,
                  restricted: pinnable.location.restricted,
                  scheduling_restricted: pinnable.location.scheduling_restricted,
                  timeLimit: pinnable.location.max_allowed_time,
                  advOptState: this.overlayService.pageState.getValue().data.advancedOptions
              };
          } else if (this.currentPage === Pages.EditRoomInFolder) {
              const data: Location = this.overlayService.pageState.getValue().data.selectedRoomsInFolder[0];
              this.data = {
                  roomName: data.title,
                  roomNumber: data.room,
                  timeLimit: data.max_allowed_time,
                  selectedTeachers: data.teachers,
                  travelType: data.travel_types,
                  restricted: data.restricted,
                  scheduling_restricted: data.scheduling_restricted,
                  advOptState: this.overlayService.pageState.getValue().data.advancedOptions
              };
          }
      }
      this.initialData = _.cloneDeep(this.data);
      merge(this.form.valueChanges, this.change$).subscribe(() => {
          // console.log('Initial', this.initialData);
          // console.log('Current', this.data);
          this.checkValidRoomOptions();

          // console.log('Lodash Result ===>>>', _.isEqual(_.omit(this.initialData, 'advOptState'), _.omit(this.data, 'advOptState')));
          setTimeout(() => {
              this.roomDataResult.emit(this.data);
          }, 10);
      });
  }

  checkValidRoomOptions() {
      if ( _.isEqual(_.omit(this.initialData, 'advOptState'), _.omit(this.data, 'advOptState'))) {
          if (this.form.valid) {
              this.roomValidButtons = {
                  publish: false,
                  incomplete: false,
                  cancel: false
              };
          } else {
              this.roomValidButtons = {
                  publish: false,
                  incomplete: true,
                  cancel: false
              };
          }
      } else {
        if (this.form.valid) {
            this.roomValidButtons = {
                publish: true,
                incomplete: false,
                cancel: true
            };
        } else {
            this.roomValidButtons = {
                publish: false,
                incomplete: true,
                cancel: true
            };
        }
      }

      console.log('Rooms Predicate ==>>', this.roomValidButtons);
  }

  selectTeacherEvent(teachers) {
    this.data.selectedTeachers = teachers;
    this.change$.next();
  }

  travelUpdate(type) {
    let travelType: string[];
    if (type === 'Round-trip') {
        travelType = ['round_trip'];
    } else if (type === 'One-way') {
        travelType = ['one_way'];
    } else if (type === 'Both') {
        travelType = ['one_way', 'round_trip'];
    }
    this.data.travelType = travelType;
    this.change$.next();
  }

  restrictedEvent(isRestricted) {
      this.data.restricted = isRestricted === 'Restricted';
      this.change$.next();
  }

  schedulingRestrictedEvent(isRestricted) {
      this.data.scheduling_restricted = isRestricted === 'Restricted';
      this.change$.next();
  }

  advancedOptionsOpened(event: boolean, advancedOptionsRef: HTMLElement) {
    if (event) {
        setTimeout(() => {
            advancedOptionsRef.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        }, 10);
    }
  }

  advancedOptions({options, validButtons}) {
      this.data.advOptState = options;
      // console.log('Buttons ===>>', validButtons);
      this.advOptionsValidButtons = validButtons;
      this.change$.next();
  }

  deleteRoom() {
      const pinnable = this.overlayService.pageState.getValue().data.pinnable;
      const deletions = [
          this.hallPassService.deletePinnable(pinnable.id)
      ];

      if (pinnable.location) {
          deletions.push(this.locationService.deleteLocation(pinnable.location.id));
      }

      zip(...deletions).subscribe(res => {
          this.dialogRef.close();
      });
  }
}
