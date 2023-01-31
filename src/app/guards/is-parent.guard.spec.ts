import { TestBed } from '@angular/core/testing';

import { IsParentGuard } from './is-parent.guard';

describe('IsParentGuard', () => {
	let guard: IsParentGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(IsParentGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
