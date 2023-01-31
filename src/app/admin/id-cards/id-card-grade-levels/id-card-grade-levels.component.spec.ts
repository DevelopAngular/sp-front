import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCardGradeLevelsComponent } from './id-card-grade-levels.component';

describe('IdCardGradeLevelsComponent', () => {
	let component: IdCardGradeLevelsComponent;
	let fixture: ComponentFixture<IdCardGradeLevelsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [IdCardGradeLevelsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(IdCardGradeLevelsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
