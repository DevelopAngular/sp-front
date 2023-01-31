import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLimitDialogComponent } from './admin-pass-limits-dialog.component';

describe('PassLimitDialogComponent', () => {
	let component: PassLimitDialogComponent;
	let fixture: ComponentFixture<PassLimitDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PassLimitDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PassLimitDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
