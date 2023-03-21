import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuxHelpCenterComponent } from './nux-help-center.component';

describe('NuxHelpCenterComponent', () => {
	let component: NuxHelpCenterComponent;
	let fixture: ComponentFixture<NuxHelpCenterComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NuxHelpCenterComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NuxHelpCenterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
