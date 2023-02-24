import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { WaitingInLinePass } from '../models/WaitInLine';
import { HttpService } from './http-service';
import { concatMap } from 'rxjs/operators';
import { HallPassErrors, StartWaitingInLinePassResponse } from './hall-passes.service';

export const sortWilByPosition = (pass1: WaitingInLinePass, pass2: WaitingInLinePass): number => pass1.line_position - pass2.line_position;

/**
 * This service contains all business logic responsible for interacting with the WaitingInLine API and
 * handling its data between components.
 */
@Injectable({
	providedIn: 'root',
})
export class WaitInLineService {
	constructor(private http: HttpService) {}

	startWilPassNow(id: string | number): Observable<StartWaitingInLinePassResponse> {
		const waiting_in_line_pass_id = parseInt(id.toString(), 10);
		return this.http
			.post<StartWaitingInLinePassResponse>('v2/hall_passes/start_waiting_in_line_pass', { waiting_in_line_pass_id }, undefined, false)
			.pipe(
				concatMap((response) => {
					if (response?.conflict_student_ids?.length > 0) {
						return throwError(HallPassErrors.Encounter);
					}

					return of(response);
				})
			);
	}

	deleteWilPass(id: string | number): Observable<never> {
		id = parseInt(id.toString(), 10); // force convert to number
		return this.http.post('v2/waiting_in_line_pass/delete', { waiting_in_line_pass_id: id }, undefined, false);
	}
}
