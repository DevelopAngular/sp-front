import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class HelpCenterService {
	@Output() open$: EventEmitter<boolean> = new EventEmitter();

	public isHelpCenterOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	openHelp() {
		this.open$.emit(true);
	}
}
