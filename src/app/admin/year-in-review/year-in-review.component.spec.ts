import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearInReviewComponent } from './year-in-review.component';

describe('YearInReviewComponent', () => {
	let component: YearInReviewComponent;
	let fixture: ComponentFixture<YearInReviewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [YearInReviewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(YearInReviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
