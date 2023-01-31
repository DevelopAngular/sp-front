import { TestBed } from '@angular/core/testing';

import { KioskSettingsGuard } from './kiosk-settings.guard';

describe('KioskSettingsGuard', () => {
	let guard: KioskSettingsGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(KioskSettingsGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
