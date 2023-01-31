import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteKioskModeComponent } from './confirm-delete-kiosk-mode.component';

describe('ConfirmDeleteKioskModeComponent', () => {
	let component: ConfirmDeleteKioskModeComponent;
	let fixture: ComponentFixture<ConfirmDeleteKioskModeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfirmDeleteKioskModeComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfirmDeleteKioskModeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
