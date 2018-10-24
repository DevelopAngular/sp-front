import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallmonitorComponent } from './hallmonitor.component';

describe('HallmonitorComponent', () => {
  let component: HallmonitorComponent;
  let fixture: ComponentFixture<HallmonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallmonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallmonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
