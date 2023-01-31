import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLimitInputComponent } from './pass-limit-input.component';

describe('PassLimitInputComponent', () => {
	let component: PassLimitInputComponent;
	let fixture: ComponentFixture<PassLimitInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PassLimitInputComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PassLimitInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
