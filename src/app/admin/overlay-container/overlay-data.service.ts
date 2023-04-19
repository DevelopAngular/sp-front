import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';

import { User } from '../../models/User';
import { Pinnable } from '../../models/Pinnable';
import { OptionState, ValidButtons } from './advanced-options/advanced-options.component';
import { VisibilityOverStudents } from './visibility-room/visibility-room.type';

export interface PageState {
	currentPage: OverlayPages;
	previousPage: OverlayPages;
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
export enum OverlayPages {
	NewRoom = 'new room', // 1
	EditRoom = 'edit room', // 2
	NewFolder = 'new folder', // 3
	EditFolder = 'edit folder', // 4
	NewRoomInFolder = 'new room in folder', // 5
	EditRoomInFolder = 'edit room in folder', // 6
	ImportRooms = 'import rooms', // 7
	AddExistingRooms = 'add existing rooms', //8
	BulkEditRooms = 'bulk edit rooms', // 9
	BulkEditRoomsInFolder = 'bulk edit rooms in folder', //10
	Delete = 'delete',
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

export interface RoomDataResult {
	data: RoomData;
	buttonState: ValidButtons;
	advOptButtons?: ValidButtons;
}

export interface BulkEditDataResult {
	roomData: RoomData;
	rooms: any[];
	buttonState?: ValidButtons;
	pinnables?: Pinnable[];
}
export interface FolderDataResult {
	data: FolderData;
	buttonState: ValidButtons;
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
	roomsInFolder: any[];
	selectedRoomsInFolder: Pinnable[];

	// roomsInFolderLoaded: used as a check to tell when it's safe to pull data from this interface
	roomsInFolderLoaded: boolean;

	// selectedRoomToEdit: A single room selected to be edited
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

	public changePage(next: OverlayPages, previous: OverlayPages, data: PageStateData): void {
		console.log('changePage', data);
		this.pageState.next({
			currentPage: next,
			previousPage: previous,
			data: data,
		});
	}

	public updatePage(next: OverlayPages, previous: OverlayPages, data: Partial<PageStateData>): void {
		const old = this.pageState.getValue();
		const newdata = cloneDeep({ ...old.data, ...data });
		const updated = {
			currentPage: next,
			previousPage: previous,
			data: newdata,
		};
		this.pageState.next(updated);
	}
	public patchData(data: Partial<PageStateData>): void {
		const old = this.pageState.getValue();
		const newdata = cloneDeep({ ...old.data, ...data });
		const patched = {
			currentPage: old.currentPage,
			previousPage: old.previousPage,
			data: newdata,
		};
		this.pageState.next(patched);
	}

	public back(data: Partial<PageStateData>): void {
		this.updatePage(this.pageState.getValue().previousPage, this.pageState.getValue().currentPage, data);
	}
}
