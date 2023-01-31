import { TestBed } from '@angular/core/testing';

import { RecurringSchedulePassService } from './recurring-schedule-pass.service';

describe('RecurringSchedulePassService', () => {
	let service: RecurringSchedulePassService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(RecurringSchedulePassService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
