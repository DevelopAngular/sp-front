import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallMonitorComponent } from './hall-monitor.component';

describe('HallMonitorComponent', () => {
  let component: HallMonitorComponent;
  let fixture: ComponentFixture<HallMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
