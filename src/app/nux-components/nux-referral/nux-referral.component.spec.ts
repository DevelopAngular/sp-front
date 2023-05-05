import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuxReferralComponent } from './nux-referral.component';

describe('NuxReferralComponent', () => {
	let component: NuxReferralComponent;
	let fixture: ComponentFixture<NuxReferralComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NuxReferralComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NuxReferralComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
