import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralPageComponent } from './referral-page.component';

describe('ReferralPageComponent', () => {
	let component: ReferralPageComponent;
	let fixture: ComponentFixture<ReferralPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ReferralPageComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ReferralPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
