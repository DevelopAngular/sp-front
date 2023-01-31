import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportButtonComponent } from './support-button.component';

describe('SupportButtonComponent', () => {
	let component: SupportButtonComponent;
	let fixture: ComponentFixture<SupportButtonComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SupportButtonComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SupportButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
