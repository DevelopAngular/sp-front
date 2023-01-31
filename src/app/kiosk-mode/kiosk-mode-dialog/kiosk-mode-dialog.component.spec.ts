import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskModeDialogComponent } from './kiosk-mode-dialog.component';

describe('KioskModeDialogComponent', () => {
	let component: KioskModeDialogComponent;
	let fixture: ComponentFixture<KioskModeDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [KioskModeDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(KioskModeDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
