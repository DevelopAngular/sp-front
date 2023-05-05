import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewsComponent } from './teacher-reviews.component';

describe('TeacherReviewsComponent', () => {
	let component: TeacherReviewsComponent;
	let fixture: ComponentFixture<TeacherReviewsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TeacherReviewsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherReviewsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
