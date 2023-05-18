import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Pinnable } from '../../../models/Pinnable';
import { Location } from '../../../models/Location';
import { LocationsService } from '../../../services/locations.service';
import { BulkEditDataResult, OverlayDataService, OverlayPages, RoomData } from '../overlay-data.service';
import { ValidButtons } from '../advanced-options/advanced-options.component';
import { isNull } from 'lodash';
import { RoomDialogData } from '../overlay-container.component';

@Component({
	selector: 'app-bulk-edit-rooms',
	templateUrl: './bulk-edit-rooms.component.html',
	styleUrls: ['./bulk-edit-rooms.component.scss'],
})
export class BulkEditRoomsComponent implements OnInit {
	@Input() form: FormGroup;

	@Input() passLimitForm: FormGroup;

	@Input() visibilityForm?: FormGroup;

	@Input() showErrors: boolean;

	@Output()
	bulkEditResult: EventEmitter<BulkEditDataResult> = new EventEmitter<BulkEditDataResult>();

	selectedRooms: any[] = [];
	selectedPinnables: Pinnable[] = [];

	advOptionsButtons: ValidButtons;

	roomsValidButtons: ValidButtons = {
		publish: false,
		incomplete: false,
		cancel: false,
	};

	roomData: RoomData;
	currentPage: OverlayPages = this.overlayData.pageState.getValue().currentPage;

	constructor(
		@Inject(MAT_DIALOG_DATA) public dialogData: RoomDialogData,
		private locationService: LocationsService,
		private overlayData: OverlayDataService
	) {}

	ngOnInit() {
		if (this.dialogData.rooms) {
			this.selectedPinnables = this.dialogData.rooms;

			this.selectedPinnables.forEach((pinnable: Pinnable) => {
				if (pinnable.type === 'category') {
					this.locationService.getLocationsWithCategory(pinnable.category).subscribe((res: Location[]) => {
						this.selectedRooms = [...this.selectedRooms, ...res];
					});
				} else {
					this.selectedRooms.push(pinnable.location);
				}
			});
		}
	}

	roomResult({ data, buttonState, advOptButtons }) {
		this.roomData = data;
		this.advOptionsButtons = advOptButtons;
		this.checkValidForm();
	}

	checkValidForm() {
		if (
			(this.roomData.travelType.length ||
				!isNull(this.roomData.restricted) ||
				!isNull(this.roomData.scheduling_restricted) ||
				!isNull(this.roomData.ignore_students_pass_limit) ||
				this.roomData.timeLimit ||
				this.roomData.selectedTeachers.length) &&
			!this.advOptionsButtons
		) {
			this.roomsValidButtons = { publish: true, incomplete: false, cancel: true };
		} else if (
			this.roomData.travelType.length ||
			!isNull(this.roomData.restricted) ||
			!isNull(this.roomData.scheduling_restricted) ||
			!isNull(this.roomData.ignore_students_pass_limit) ||
			this.roomData.timeLimit ||
			this.roomData.selectedTeachers.length ||
			this.advOptionsButtons
		) {
			if (this.advOptionsButtons.incomplete) {
				this.roomsValidButtons = { publish: false, incomplete: true, cancel: true };
			} else {
				this.roomsValidButtons = { publish: true, incomplete: false, cancel: true };
			}
		}

		if (this.visibilityForm.invalid) {
			this.roomsValidButtons = { publish: false, incomplete: true, cancel: true };
		}

		this.bulkEditResult.emit({
			roomData: this.roomData,
			rooms: this.selectedRooms,
			pinnables: this.selectedPinnables,
			buttonState: this.roomsValidButtons,
		});
	}
}
