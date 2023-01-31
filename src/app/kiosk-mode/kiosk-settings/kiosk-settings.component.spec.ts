import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskSettingsComponent } from './kiosk-settings.component';

describe('KioskSettingsComponent', () => {
	let component: KioskSettingsComponent;
	let fixture: ComponentFixture<KioskSettingsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [KioskSettingsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(KioskSettingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
