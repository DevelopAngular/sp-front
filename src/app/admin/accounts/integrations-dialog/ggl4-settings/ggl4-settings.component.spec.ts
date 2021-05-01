import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ggl4SettingsComponent} from './ggl4-settings.component';

describe('Ggl4SettingsComponent', () => {
  let component: Ggl4SettingsComponent;
  let fixture: ComponentFixture<Ggl4SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ggl4SettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ggl4SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
