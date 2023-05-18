import { TestBed } from '@angular/core/testing';

import { YearInReviewService } from './year-in-review.service';

describe('TeacherReviewsService', () => {
	let service: YearInReviewService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(YearInReviewService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
