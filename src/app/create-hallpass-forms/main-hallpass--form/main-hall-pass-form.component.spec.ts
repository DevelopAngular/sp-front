import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHallPassFormComponent } from './main-hall-pass-form.component';

describe('MainHallPassFormComponent', () => {
  let component: MainHallPassFormComponent;
  let fixture: ComponentFixture<MainHallPassFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainHallPassFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainHallPassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
