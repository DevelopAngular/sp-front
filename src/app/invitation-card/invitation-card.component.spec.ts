import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationCardComponent } from './invitation-card.component';

describe('InvitationCardComponent', () => {
	let component: InvitationCardComponent;
	let fixture: ComponentFixture<InvitationCardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [InvitationCardComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(InvitationCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
