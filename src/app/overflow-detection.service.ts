import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare let ResizeObserver;

@Injectable({
	providedIn: 'root',
})
export class OverflowDetectionService {
	constructor(private ngZone: NgZone) {}

	createOverflowObserver(element: HTMLElement): Observable<boolean> {
		const subject = new Subject<boolean>();

		this.ngZone.runOutsideAngular(() => {
			const observer = new ResizeObserver(() => {
				const overflow = element.scrollHeight > element.clientHeight;
				this.ngZone.run(() => {
					subject.next(overflow);
				});
			});

			observer.observe(element);
		});

		return subject.asObservable();
	}
}
