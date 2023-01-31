import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCheckinCodeDialogComponent } from './room-checkin-code-dialog.component';

describe('RoomCheckinCodeDialogComponent', () => {
	let component: RoomCheckinCodeDialogComponent;
	let fixture: ComponentFixture<RoomCheckinCodeDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RoomCheckinCodeDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RoomCheckinCodeDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
