import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalBoxComponent } from './renewal-box.component';

describe('RenewalBoxComponent', () => {
	let component: RenewalBoxComponent;
	let fixture: ComponentFixture<RenewalBoxComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RenewalBoxComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RenewalBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
