import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationRoomFormComponent } from './notification-room-form.component';

describe('NotificationRoomFormComponent', () => {
	let component: NotificationRoomFormComponent;
	let fixture: ComponentFixture<NotificationRoomFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NotificationRoomFormComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NotificationRoomFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
