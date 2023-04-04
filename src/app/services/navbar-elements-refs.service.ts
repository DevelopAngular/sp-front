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

	private _renewalReminderIFrameFill = new BehaviorSubject<boolean>(false);
	private _renewalReminderIFrameFill$ = this._renewalReminderIFrameFill.asObservable();

	getPointerVisible(): Observable<boolean> {
		return this._pointerVisible$;
	}

	setPointerVisible(isVisible: boolean) {
		this._pointerVisible.next(isVisible);
	}

	getRenewalReminderFill(): Observable<boolean> {
		return this._renewalReminderFill$;
	}

	setRenewalReminderFill(isFilled: boolean) {
		return this._renewalReminderFill.next(isFilled);
	}

	getRenewalIFrameFill(): Observable<boolean> {
		return this._renewalReminderIFrameFill$;
	}

	setRenewalIFrameFill(isFilled: boolean) {
		return this._renewalReminderIFrameFill.next(isFilled);
	}
}
