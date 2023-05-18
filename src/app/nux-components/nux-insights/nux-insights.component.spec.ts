import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuxInsightsComponent } from './nux-insights.component';

describe('NuxInsightsComponent', () => {
	let component: NuxInsightsComponent;
	let fixture: ComponentFixture<NuxInsightsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NuxInsightsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NuxInsightsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
