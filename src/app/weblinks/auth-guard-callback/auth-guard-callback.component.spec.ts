import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthGuardCallbackComponent } from './auth-guard-callback.component';

describe('AuthGuardCallbackComponent', () => {
	let component: AuthGuardCallbackComponent;
	let fixture: ComponentFixture<AuthGuardCallbackComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AuthGuardCallbackComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AuthGuardCallbackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
