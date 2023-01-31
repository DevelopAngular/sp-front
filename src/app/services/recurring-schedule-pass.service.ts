import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { RecurringConfig } from '../models/RecurringFutureConfig';

const RECURRING_ENDPOINT = 'v1/recurring_scheduled_config';

@Injectable({
	providedIn: 'root',
})
export class RecurringSchedulePassService {
	constructor(private http: HttpService) {}

	getRecurringScheduledConfig(config_id: number) {
		return this.http.get<RecurringConfig>(`${RECURRING_ENDPOINT}?id=${config_id}`);
	}
}
