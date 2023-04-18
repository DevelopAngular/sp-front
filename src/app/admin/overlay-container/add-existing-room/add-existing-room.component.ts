import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pinnable } from '../../../models/Pinnable';
import { bumpIn } from '../../../animations';

@Component({
	selector: 'app-add-existing-room',
	templateUrl: './add-existing-room.component.html',
	styleUrls: ['./add-existing-room.component.scss'],
	animations: [bumpIn],
})
export class AddExistingRoomComponent implements OnInit {
	@Input() roomsInFolder: Pinnable[];
	@Input() pinnables: Pinnable[];
	@Input() roomName: string;

	@Output() back: EventEmitter<void> = new EventEmitter();
	@Output() save: EventEmitter<Pinnable[]> = new EventEmitter();

	constructor() {}

	public ngOnInit(): void {}

	public goBack(): void {
		this.back.emit();
	}

	public addRooms(): void {
		this.save.emit(this.roomsInFolder);
	}
}
