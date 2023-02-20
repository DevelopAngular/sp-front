import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WaitingInLinePass } from '../models/WaitInLine';
import { HttpService } from './http-service';

/**
 * This service contains any non-UI logic regarding Wait In Line.
 * This includes data parsing as well as http requests
 * Currently, it represents a mock server while the backend is being built.
 */
@Injectable({
	providedIn: 'root',
})
export class WaitInLineService {
	fakeWil = new BehaviorSubject<WaitingInLinePass>(null);
	fakeWilActive = new BehaviorSubject<boolean>(false);

	constructor(private http: HttpService) {}

	deleteWilPass(id: string | number): Observable<never> {
		id = parseInt(id.toString(), 10); // force convert to number
		return this.http.post('v2/waiting_in_line_pass/delete', { waiting_in_line_pass_id: id }, undefined, false);
	}
}
