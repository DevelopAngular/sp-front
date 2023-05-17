import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialBarComponent } from './trial-bar.component';

describe('TrialBarComponent', () => {
	let component: TrialBarComponent;
	let fixture: ComponentFixture<TrialBarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TrialBarComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TrialBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
