import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';

import { User } from '../../models/User';
import { Pinnable } from '../../models/Pinnable';
import { OptionState } from './advanced-options/advanced-options.component';
import { VisibilityOverStudents } from './visibility-room/visibility-room.type';

export interface PageState {
	currentPage: number;
	previousPage: number;
	data: PageStateData;
}

export interface PageStateData {
	pinnable: Pinnable;
	advancedOptions?: OptionState;
	visibility?: VisibilityOverStudents;
	roomsInFolder?: any[];
	selectedRoomsInFolder?: any[];
	roomsInFolderLoaded?: boolean;
	folderName?: string;
	oldFolderData?: FolderData;
	roomsToDelete?: any[];
	show_as_origin_room?: boolean;
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
	BulkEditRoomsInFolder = 10,
}

export interface RoomData {
	id?: number;
	roomName: string;
	roomNumber: string;
	timeLimit: number | string;
	selectedTeachers: User[];
	travelType?: string[];
	travel_types?: string[];
	restricted: boolean;
	scheduling_restricted: boolean;
	ignore_students_pass_limit: boolean;
	show_as_origin_room: boolean;
	needs_check_in: boolean;
	advOptState: OptionState;
	visibility?: VisibilityOverStudents;
	enable: boolean;
	isEdit?: boolean;
	gradient?: string;
	category?: string;
}

/**
 * FolderData is responsible for describing the data between the OverlayContainerComponent
 * and its children regarding editing folders
 */
export interface FolderData {
	// folderName: Name of the Room Folder as it appears on the UI (without category name)
	folderName: string;

	ignore_students_pass_limit: boolean;
	show_as_origin_room: boolean;

	// roomsInFolder: List of rooms associated with the folder. Associated by category
	// TODO: Properly type this. Remove `any` type
	roomsInFolder: any[];

	selectedRoomsInFolder: Pinnable[];

	// roomsInFolderLoaded: used as a check to tell when it's safe to pull data from this interface
	roomsInFolderLoaded: boolean;

	// selectedRoomToEdit: A single room selected to be edited
	// TODO: Properly type this. Remove `any` type
	selectedRoomToEdit: any;

	// roomsToDelete: List of rooms to be deleted from a folder. This list is filled
	roomsToDelete: any[];
}

export interface TooltipText {
	teachers: string;
	travel: string;
	timeLimit: string;
	restriction: string;
	scheduling_restricted: string;
	ignore_students_pass_limit: string;
	needs_check_in: string;
	show_as_origin_room: string;
}
@Injectable({
	providedIn: 'root',
})
export class OverlayDataService {
	pageState: BehaviorSubject<PageState> = new BehaviorSubject<PageState>(null);

	roomNameBlur$: Subject<any> = new Subject();
	folderNameBlur$: Subject<any> = new Subject<any>();

	dropEvent$: Subject<any> = new Subject();
	dragEvent$: Subject<any> = new Subject();

	public tooltipText: TooltipText = {
		teachers: 'Which teachers should see pass activity in this room?',
		travel: 'Will the room will be available to make only round-trip passes, only one-way passes, or both?',
		timeLimit: 'What is the maximum time limit that a student can make the pass for themselves?',
		restriction: 'Does the pass need digital approval from a teacher to become an active pass?',
		scheduling_restricted: 'Does the pass need digital approval from a teacher to become a scheduled pass?',
		ignore_students_pass_limit: `Should this room count toward student pass limits, if enabled?`,
		needs_check_in: 'Passes must be ended using the Room Code, Teacher’s Pin, or from a Teacher’s device.',
		show_as_origin_room: 'Should this room only be allowed as a destination?',
	};

	constructor() {}

	changePage(next, previous, data) {
		this.pageState.next({
			currentPage: next,
			previousPage: previous,
			data: data,
		});
	}

	public patchData(data) {
		const old = this.pageState.getValue();
		const newdata = cloneDeep({ ...old.data, ...data });
		const patched = {
			currentPage: old.currentPage,
			previousPage: old.previousPage,
			data: newdata,
		};
		this.pageState.next(patched);
	}

	back(data) {
		this.changePage(this.pageState.getValue().previousPage, this.pageState.getValue().currentPage, data);
	}
}
