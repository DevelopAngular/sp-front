import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskModeComponent } from './kiosk-mode.component';

describe('KioskModeComponent', () => {
  let component: KioskModeComponent;
  let fixture: ComponentFixture<KioskModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KioskModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KioskModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
