import { TestBed } from '@angular/core/testing';

import { CheckIfLoggedInGuard } from './check-if-logged-in.guard';

describe('CheckIfLoggedInGuard', () => {
	let guard: CheckIfLoggedInGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(CheckIfLoggedInGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
