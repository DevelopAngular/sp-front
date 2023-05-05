import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewBoxComponent } from './teacher-review-box.component';

describe('TeacherReviewBoxComponent', () => {
	let component: TeacherReviewBoxComponent;
	let fixture: ComponentFixture<TeacherReviewBoxComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TeacherReviewBoxComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherReviewBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
