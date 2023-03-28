import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreaksDialogComponent } from './streaks-dialog.component';

describe('StreaksDialogComponent', () => {
	let component: StreaksDialogComponent;
	let fixture: ComponentFixture<StreaksDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StreaksDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StreaksDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
