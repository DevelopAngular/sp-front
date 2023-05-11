import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewsPageComponent } from './teacher-reviews-page.component';

describe('TeacherReviewsPageComponent', () => {
	let component: TeacherReviewsPageComponent;
	let fixture: ComponentFixture<TeacherReviewsPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TeacherReviewsPageComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherReviewsPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
