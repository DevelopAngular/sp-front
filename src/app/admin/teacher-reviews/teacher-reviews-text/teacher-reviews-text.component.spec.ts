import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewsTextComponent } from './teacher-reviews-text.component';

describe('TeacherReviewsTextComponent', () => {
	let component: TeacherReviewsTextComponent;
	let fixture: ComponentFixture<TeacherReviewsTextComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TeacherReviewsTextComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherReviewsTextComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
