import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../../models/User';

export interface PageState {
    currentPage: number;
    previousPage: number;
}

export interface RoomData {
    roomName: string;
    roomNumber: string | number;
    roomIcon: string;
    roomTeachers: User[];
    travelType: string[];
    timeLimit: number;
    restricted: boolean;
    scheduling_restricted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OverlayDataService {

  pageState: PageState;

  roomNameBlur$: Subject<any> = new Subject();

  public tooltipText = {
      teachers: 'Which teachers should see pass activity in this room?',
      travel: 'Will the the room will be available to make only round-trip passes, only one-way passes, or both?',
      timeLimit: 'What is the maximum time limit that a student can make the pass for themselves?',
      restriction: 'Does the pass need digital approval from a teacher to become an active pass?',
      scheduling_restricted: 'Does the pass need digital approval from a teacher to become a scheduled pass?'
  };

  data: RoomData;

  constructor() {
  }

  changePage(next, previous) {
      this.pageState = {
          currentPage: next,
          previousPage: previous
      };
  }
}
