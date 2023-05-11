import { TestBed } from '@angular/core/testing';

import { TeacherReviewsService } from './teacher-reviews.service';

describe('TeacherReviewsService', () => {
	let service: TeacherReviewsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TeacherReviewsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
