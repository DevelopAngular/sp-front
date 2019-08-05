import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { User } from '../../models/User';
import { Pinnable } from '../../models/Pinnable';
import { OptionState } from './advanced-options/advanced-options.component';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';

export interface PageState {
    currentPage: number;
    previousPage: number;
    data: {
      pinnable: Pinnable,
      advancedOptions: OptionState,
      roomsInFolder;
      selectedRoomsInFolder: any[];
      roomsInFolderLoaded: boolean;
      folderName: string;
      oldFolderData: FolderData
    };
}

export enum Pages {
    NewRoom = 1,
    EditRoom = 2,
    NewFolder = 3,
    EditFolder = 4,
    NewRoomInFolder = 5,
    EditRoomInFolder = 6,
    ImportRooms = 7,
    AddExistingRooms = 8,
    BulkEditRooms = 9,
    BulkEditRoomsInFolder = 10
}


export interface RoomData {
    id?: string;
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
    roomsInFolder: any[];
    selectedRoomsInFolder: any[];
    roomsInFolderLoaded: boolean;
    selectedRoomToEdit: any;
    roomsToDelete: any[]
}

@Injectable({
  providedIn: 'root'
})
export class OverlayDataService {

  pageState: BehaviorSubject<PageState> = new BehaviorSubject<PageState>(null);

  roomNameBlur$: Subject<any> = new Subject();

  dropEvent$ = new Subject();
  dragEvent$ = new Subject();

  public tooltipText = {
      teachers: 'Which teachers should see pass activity in this room?',
      travel: 'Will the the room will be available to make only round-trip passes, only one-way passes, or both?',
      timeLimit: 'What is the maximum time limit that a student can make the pass for themselves?',
      restriction: 'Does the pass need digital approval from a teacher to become an active pass?',
      scheduling_restricted: 'Does the pass need digital approval from a teacher to become a scheduled pass?'
  };

  constructor(private formService: CreateFormService,) {
  }

  changePage(next, previous, data) {
      this.pageState.next({
          currentPage: next,
          previousPage: previous,
          data: data
      });
  }

  back(data) {
      this.changePage(this.pageState.getValue().previousPage, this.pageState.getValue().currentPage, data);
  }
}
