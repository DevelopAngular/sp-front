import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { User } from '../../models/User';
import { Pinnable } from '../../models/Pinnable';
import { Location } from '../../models/Location';
import { OptionState } from './advanced-options/advanced-options.component';

export interface PageState {
    currentPage: number;
    previousPage: number;
    data: {
      pinnable: Pinnable,
      advancedOptions: OptionState
    };
}

export interface RoomData {
    roomName: string;
    roomNumber: string;
    timeLimit: number | string;
    selectedTeachers: User[];
    travelType: string[];
    restricted: boolean;
    scheduling_restricted: boolean;
    advOptState: OptionState;
}

export interface FolderData {
    folderName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OverlayDataService {

  pageState: BehaviorSubject<PageState> = new BehaviorSubject<PageState>(null);

  roomNameBlur$: Subject<any> = new Subject();

  public tooltipText = {
      teachers: 'Which teachers should see pass activity in this room?',
      travel: 'Will the the room will be available to make only round-trip passes, only one-way passes, or both?',
      timeLimit: 'What is the maximum time limit that a student can make the pass for themselves?',
      restriction: 'Does the pass need digital approval from a teacher to become an active pass?',
      scheduling_restricted: 'Does the pass need digital approval from a teacher to become a scheduled pass?'
  };

  constructor() {
  }

  changePage(next, previous, data) {
      this.pageState.next({
          currentPage: next,
          previousPage: previous,
          data: data
      });
  }
}
