import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallPassComponent } from './hall-pass.component';

describe('HallPassComponent', () => {
  let component: HallPassComponent;
  let fixture: ComponentFixture<HallPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
