import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SettingsDescriptionPopupComponent} from './settings-description-popup.component';

describe('SettingsDescriptionPopupComponent', () => {
  let component: SettingsDescriptionPopupComponent;
  let fixture: ComponentFixture<SettingsDescriptionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsDescriptionPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsDescriptionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
