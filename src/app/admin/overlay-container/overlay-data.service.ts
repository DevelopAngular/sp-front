import {Injectable} from '@angular/core';

import {BehaviorSubject, Subject} from 'rxjs';

import {User} from '../../models/User';
import {Pinnable} from '../../models/Pinnable';
import {OptionState} from './advanced-options/advanced-options.component';
import {VisibilityOverStudents} from './visibility-room/visibility-room.type';

export interface PageState {
    currentPage: number;
    previousPage: number;
    data: {
      pinnable: Pinnable;
      advancedOptions: OptionState;
      visibility?: VisibilityOverStudents;
      roomsInFolder;
      selectedRoomsInFolder: any[];
      roomsInFolderLoaded: boolean;
      folderName: string;
      oldFolderData: FolderData;
      roomsToDelete?: any[];
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
    visibility?: VisibilityOverStudents;
    enable: boolean;
}

/**
 * FolderData is responsible for describing the data between the OverlayContainerComponent
 * and its children regarding editing folders
 */
export interface FolderData {
  // folderName: Name of the Room Folder as it appears on the UI (without category name)
  folderName: string;

  // roomsInFolder: List of rooms associated with the folder. Associated by category
  // TODO: Properly type this. Remove `any` type
  roomsInFolder: any[];

  // selectedRoomsInFolder: List of rooms in folder currently selected to be either edited or deleted
  // TODO: Properly type this. Remove `any` type
  selectedRoomsInFolder: any[];

  // roomsInFolderLoaded: used as a check to tell when it's safe to pull data from this interface
  roomsInFolderLoaded: boolean;

  // selectedRoomToEdit: A single room selected to be edited
  // TODO: Properly type this. Remove `any` type
  selectedRoomToEdit: any;

  // roomsToDelete: List of rooms to be deleted from a folder. This list is filled
  roomsToDelete: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OverlayDataService {

  pageState: BehaviorSubject<PageState> = new BehaviorSubject<PageState>(null);

  roomNameBlur$: Subject<any> = new Subject();
  folderNameBlur$: Subject<any> = new Subject<any>();

  dropEvent$ = new Subject();
  dragEvent$ = new Subject();

  public tooltipText = {
      teachers: 'Which teachers should see pass activity in this room?',
      travel: 'Will the room will be available to make only round-trip passes, only one-way passes, or both?',
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

  replaceData(data) {
      this.pageState.next({
          ...this.pageState.getValue(),
          data,
      });
  }

  public patchData(data) {
    const old = this.pageState.getValue();
    data = {...old.data, ...data};
    this.pageState.next({
      currentPage: old.currentPage,
      previousPage: old.previousPage,
      data,
    });
  }

  back(data) {
      this.changePage(this.pageState.getValue().previousPage, this.pageState.getValue().currentPage, data);
  }
}
