import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeTourComponent } from './take-tour.component';

describe('TakeTourComponent', () => {
  let component: TakeTourComponent;
  let fixture: ComponentFixture<TakeTourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeTourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
