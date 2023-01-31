import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentSettingComponent } from './parent-setting.component';

describe('ParentSettingComponent', () => {
	let component: ParentSettingComponent;
	let fixture: ComponentFixture<ParentSettingComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ParentSettingComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ParentSettingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
