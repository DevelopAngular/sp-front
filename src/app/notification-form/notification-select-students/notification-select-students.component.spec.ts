import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSelectStudentsComponent } from './notification-select-students.component';

describe('NotificationSelectStudentsComponent', () => {
	let component: NotificationSelectStudentsComponent;
	let fixture: ComponentFixture<NotificationSelectStudentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NotificationSelectStudentsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NotificationSelectStudentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
