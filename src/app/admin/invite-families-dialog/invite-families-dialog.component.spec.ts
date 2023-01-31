import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteFamiliesDialogComponent } from './invite-families-dialog.component';

describe('InviteFamiliesDialogComponent', () => {
	let component: InviteFamiliesDialogComponent;
	let fixture: ComponentFixture<InviteFamiliesDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [InviteFamiliesDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(InviteFamiliesDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
