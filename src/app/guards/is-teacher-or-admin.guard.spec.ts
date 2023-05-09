import { TestBed } from '@angular/core/testing';

import { IsTeacherOrAdminGuard } from './is-teacher-or-admin.guard';

describe('IsTeacherOrAdminGuard', () => {
	let guard: IsTeacherOrAdminGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(IsTeacherOrAdminGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
