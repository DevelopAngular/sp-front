import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLimitStudentInfoComponent } from './pass-limit-student-info.component';

describe('PassLimitStudentInfoComponent', () => {
	let component: PassLimitStudentInfoComponent;
	let fixture: ComponentFixture<PassLimitStudentInfoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PassLimitStudentInfoComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PassLimitStudentInfoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
