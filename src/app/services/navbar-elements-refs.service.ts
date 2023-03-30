import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class NavbarElementsRefsService {
	constructor() {}

	public navbarRef$: Subject<ElementRef> = new ReplaySubject<ElementRef>(1);

	public schoolToggle$: Subject<ElementRef> = new ReplaySubject<ElementRef>(1);

	public langToggle$: Subject<ElementRef> = new ReplaySubject<ElementRef>(1);

	private _pointerVisible = new BehaviorSubject<boolean>(true);
	private _pointerVisible$ = this._pointerVisible.asObservable();

	private _renewalReminderFill = new BehaviorSubject<boolean>(false);
	private _renewalReminderFill$ = this._renewalReminderFill.asObservable();

	getPointerVisible(): Observable<boolean> {
		return this._pointerVisible$;
	}

	setPointerVisible(isVisible: boolean) {
		this._pointerVisible.next(isVisible);
	}

	getRenewalFill(): Observable<boolean> {
		return this._renewalReminderFill$;
	}

	setRenewalFill(isFilled: boolean) {
		return this._renewalReminderFill.next(isFilled);
	}
}
