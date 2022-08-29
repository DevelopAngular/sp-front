import {Component, OnInit} from '@angular/core';
import {User} from '../models/User';
import {Location} from '../models/Location';
import {PassLimitInfo} from '../models/HallPassLimits';

// TODO: Get proper types for fields and complete fields
export interface CreatePassDialogData {
  forLater: boolean;
  forStaff: boolean;
  forInput: boolean;
  kioskMode: boolean;
  forKioskMode: boolean;
  fromAdmin: boolean;
  adminSelectedStudent: User;
  kioskModeSelectedUser: User[];
  teacher: User;
  kioskModeRoom: Location;
  originalFromLocation: Location;
  originalToLocation: Location;
  gradient: string;
  request: any;
  missedRequest: boolean;
  resend_request: boolean;
  request_time: any;
  isDeny: boolean;
  entryState: { step: number; state: number; };
  hasClose: boolean;
  passLimitInfo: PassLimitInfo;
}

@Component({
  selector: 'app-create-hallpass-forms',
  templateUrl: './create-hallpass-forms.component.html',
  styleUrls: ['./create-hallpass-forms.component.scss']
})
export class CreateHallpassFormsComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
