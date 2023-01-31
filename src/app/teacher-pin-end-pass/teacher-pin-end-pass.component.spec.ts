import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPinEndPassComponent } from './teacher-pin-end-pass.component';

describe('TeacherPinEndPassComponent', () => {
	let component: TeacherPinEndPassComponent;
	let fixture: ComponentFixture<TeacherPinEndPassComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TeacherPinEndPassComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherPinEndPassComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
