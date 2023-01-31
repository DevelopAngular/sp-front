import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ComponentsService {
	private subject = new Subject<any>();

	constructor() {}

	sendClickEvent(action) {
		this.subject.next(action);
	}

	getClickEvent(): Observable<any> {
		return this.subject.asObservable();
	}
}
