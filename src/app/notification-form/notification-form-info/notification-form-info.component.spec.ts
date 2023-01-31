import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationFormInfoComponent } from './notification-form-info.component';

describe('NotificationFormInfoComponent', () => {
	let component: NotificationFormInfoComponent;
	let fixture: ComponentFixture<NotificationFormInfoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NotificationFormInfoComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NotificationFormInfoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
