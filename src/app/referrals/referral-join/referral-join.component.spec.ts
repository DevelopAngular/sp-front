import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralJoinComponent } from './referral-join.component';

describe('ReferralPageComponent', () => {
	let component: ReferralJoinComponent;
	let fixture: ComponentFixture<ReferralJoinComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ReferralJoinComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ReferralJoinComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
